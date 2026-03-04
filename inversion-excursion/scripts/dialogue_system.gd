class_name DialogueSystem
extends Node

# INVERSION EXCURSION - TRUTH DIALOGUE SYSTEM
# Dialogue is the gameplay. Wrong answers are teaching moments.

# ============ SIGNALS ============
signal dialogue_started(npc_id: String)
signal dialogue_ended(npc_id: String, outcome: DialogueOutcome)
signal awakening_changed(dimension: String, new_value: int, delta: int)
signal teaching_moment_triggered(moment_id: String)
signal scroll_fragment_unlocked(scroll_type: String)
signal free_text_required(prompt: String, evaluation_criteria: Dictionary)

# ============ ENUMS ============
enum DialogueOutcome {
	SUCCESS,      # Player demonstrated understanding
	PARTIAL,      # Player learned but hasn't fully awakened
	LOOP_BACK,    # Wrong answer - teaching moment triggered
	ABANDONED     # Player left dialogue
}

enum AwakeningDimension {
	SELF,      # Understanding personal identity beyond labels
	OTHER,     # Recognition of shared essence
	SYSTEM,    # Awareness of control mechanisms
	LANGUAGE,  # Ability to decode euphemisms
	SOURCE     # Direct experience of unity
}

# ============ CONFIGURATION ============
@export var max_awakening: int = 100
@export var teaching_moment_duration: float = 3.0
@export var loop_back_cooldown: float = 0.5

# ============ STATE ============
var awakening_meter: Dictionary = {
	"self": 0,
	"other": 0,
	"system": 0,
	"language": 0,
	"source": 0
}

var unlocked_scrolls: Array[String] = []
var dialogue_history: Array[Dictionary] = []
var current_dialogue: DialogueSession = null
var npc_registry: Dictionary = {}  # npc_id -> NPCData

# ============ NODE REFERENCES ============
@onready var ui_layer: CanvasLayer = $CanvasLayer
@onready var dialogue_box: Control = $CanvasLayer/DialogueBox
@onready var speaker_label: Label = $CanvasLayer/DialogueBox/SpeakerLabel
@onready var text_label: Label = $CanvasLayer/DialogueBox/TextLabel
@onready var options_container: VBoxContainer = $CanvasLayer/DialogueBox/OptionsContainer
@onready var teaching_overlay: ColorRect = $CanvasLayer/TeachingOverlay
@onready var awakening_ui: Control = $CanvasLayer/AwakeningUI

# ============ DIALOGUE DATA STRUCTURES ============
class DialogueNode:
	var id: String
	var speaker: String
	var text: String
	var options: Array[DialogueOption]
	var awakening_check: AwakeningCheck
	var teaching_moment: String  # ID of teaching moment resource
	var next_node: String
	var is_free_text: bool
	var free_text_evaluation: Dictionary
	
	func _init(p_id: String):
		id = p_id
		options = []
		is_free_text = false

class DialogueOption:
	var id: String
	var text: String
	var awakening_impact: Dictionary  # {dimension: value}
	var is_correct_path: bool
	var leads_to: String
	var teaching_fork: String  # Node to go if this is "wrong"
	var condition: Callable  # Optional condition function
	
	func _init(p_id: String, p_text: String):
		id = p_id
		text = p_text
		awakening_impact = {}
		is_correct_path = false

class AwakeningCheck:
	var dimension: String
	var minimum_value: int
	var pass_node: String
	var fail_node: String
	var custom_check: Callable
	
	func _init(p_dim: String, p_min: int):
		dimension = p_dim
		minimum_value = p_min

class DialogueSession:
	var npc_id: String
	var current_node: DialogueNode
	var history: Array[String]
	var loop_count: int
	var start_time: float
	
	func _init(p_npc: String, p_start: DialogueNode):
		npc_id = p_npc
		current_node = p_start
		history = []
		loop_count = 0
		start_time = Time.get_unix_time_from_system()

class NPCData:
	var id: String
	var display_name: String
	var dialogue_tree: Dictionary  # node_id -> DialogueNode
	var entry_node: String
	var scroll_fragment: String  # Which scroll this NPC guards
	var defeated: bool
	
	func _init(p_id: String, p_name: String):
		id = p_id
		display_name = p_name
		dialogue_tree = {}
		defeated = false

# ============ INITIALIZATION ============
func _ready():
	_hide_dialogue_ui()
	_load_npc_data()
	_load_awakening_state()

func _hide_dialogue_ui():
	dialogue_box.visible = false
	teaching_overlay.visible = false
	awakening_ui.visible = false

# ============ PUBLIC API ============
func start_dialogue(npc_id: String) -> bool:
	if not npc_registry.has(npc_id):
		push_error("NPC not found: " + npc_id)
		return false
	
	var npc = npc_registry[npc_id]
	if npc.defeated:
		# Defeated NPCs have special "remembered" dialogue
		_start_defeated_dialogue(npc)
		return true
	
	var entry_node = npc.dialogue_tree.get(npc.entry_node)
	if entry_node == null:
		push_error("Entry node not found for NPC: " + npc_id)
		return false
	
	current_dialogue = DialogueSession.new(npc_id, entry_node)
	dialogue_started.emit(npc_id)
	_show_dialogue_ui()
	_display_node(entry_node)
	
	return true

func end_dialogue(outcome: DialogueOutcome = DialogueOutcome.ABANDONED):
	if current_dialogue == null:
		return
	
	var npc_id = current_dialogue.npc_id
	_log_dialogue_session(outcome)
	
	_hide_dialogue_ui()
	dialogue_ended.emit(npc_id, outcome)
	current_dialogue = null

func select_option(option_id: String):
	if current_dialogue == null:
		return
	
	var node = current_dialogue.current_node
	var selected: DialogueOption = null
	
	for opt in node.options:
		if opt.id == option_id:
			selected = opt
			break
	
	if selected == null:
		push_error("Option not found: " + option_id)
		return
	
	# Apply awakening impact
	_apply_awakening_impact(selected.awakening_impact)
	
	# Check if this leads to teaching moment
	if not selected.is_correct_path and selected.teaching_fork != "":
		_trigger_teaching_moment(node.teaching_moment, selected.teaching_fork)
		return
	
	# Move to next node
	var next_node_id = selected.leads_to
	if next_node_id == "":
		end_dialogue(DialogueOutcome.SUCCESS)
		return
	
	var npc = npc_registry[current_dialogue.npc_id]
	var next_node = npc.dialogue_tree.get(next_node_id)
	
	if next_node == null:
		end_dialogue(DialogueOutcome.SUCCESS)
		return
	
	current_dialogue.current_node = next_node
	current_dialogue.history.append(node.id)
	_display_node(next_node)

func submit_free_text(response: String):
	if current_dialogue == null or not current_dialogue.current_node.is_free_text:
		return
	
	var evaluation = current_dialogue.current_node.free_text_evaluation
	var score = _evaluate_free_text(response, evaluation)
	
	if score >= evaluation.get("pass_threshold", 0.7):
		# Success - unlock scroll if applicable
		_handle_scroll_unlock()
		end_dialogue(DialogueOutcome.SUCCESS)
	else:
		# Loop back with teaching
		current_dialogue.loop_count += 1
		_trigger_teaching_moment(
			current_dialogue.current_node.teaching_moment,
			current_dialogue.current_node.id
		)

func get_awakening_level(dimension: String) -> int:
	return awakening_meter.get(dimension.to_lower(), 0)

func get_total_awakening() -> int:
	var total = 0
	for val in awakening_meter.values():
		total += val
	return total

func has_scroll(scroll_type: String) -> bool:
	return scroll_type in unlocked_scrolls

# ============ DISPLAY FUNCTIONS ============
func _show_dialogue_ui():
	dialogue_box.visible = true
	awakening_ui.visible = true
	_update_awakening_display()

func _display_node(node: DialogueNode):
	var npc = npc_registry[current_dialogue.npc_id]
	
	# Check awakening requirements
	if node.awakening_check != null:
		if not _check_awakening_requirement(node.awakening_check):
			var fail_node = npc.dialogue_tree.get(node.awakening_check.fail_node)
			if fail_node != null:
				current_dialogue.current_node = fail_node
				_display_node(fail_node)
			return
		else:
			var pass_node = npc.dialogue_tree.get(node.awakening_check.pass_node)
			if pass_node != null and pass_node != node:
				current_dialogue.current_node = pass_node
				_display_node(pass_node)
				return
	
	# Display speaker and text
	speaker_label.text = npc.display_name
	text_label.text = node.text
	
	# Clear and populate options
	for child in options_container.get_children():
		child.queue_free()
	
	if node.is_free_text:
		_show_free_text_input(node)
	else:
		_show_options(node)

func _show_options(node: DialogueNode):
	for option in node.options:
		# Check if option has condition
		if option.condition != null and not option.condition.call():
			continue
		
		var btn = Button.new()
		btn.text = option.text
		btn.pressed.connect(_on_option_selected.bind(option.id))
		options_container.add_child(btn)

func _show_free_text_input(node: DialogueNode):
	var prompt = LineEdit.new()
	prompt.placeholder_text = "Type your answer..."
	prompt.custom_minimum_size = Vector2(400, 40)
	options_container.add_child(prompt)
	
	var submit_btn = Button.new()
	submit_btn.text = "Speak Truth"
	submit_btn.pressed.connect(_on_free_text_submitted.bind(prompt))
	options_container.add_child(submit_btn)
	
	free_text_required.emit(node.text, node.free_text_evaluation)

# ============ TEACHING MOMENTS ============
func _trigger_teaching_moment(moment_id: String, return_node_id: String):
	if moment_id == "":
		# Just loop back without visual
		_go_to_node(return_node_id)
		return
	
	teaching_moment_triggered.emit(moment_id)
	
	# Show teaching overlay
	teaching_overlay.visible = true
	
	# Play teaching moment animation/visual
	_play_teaching_moment(moment_id)
	
	# Wait for duration
	await get_tree().create_timer(teaching_moment_duration).timeout
	
	teaching_overlay.visible = false
	
	# Return to dialogue
	_go_to_node(return_node_id)

func _play_teaching_moment(moment_id: String):
	# Override in subclass or connect to visual system
	# This is where WYRD/SynSync integration happens
	pass

func _go_to_node(node_id: String):
	var npc = npc_registry[current_dialogue.npc_id]
	var node = npc.dialogue_tree.get(node_id)
	if node != null:
		current_dialogue.current_node = node
		_display_node(node)

# ============ AWAKENING SYSTEM ============
func _apply_awakening_impact(impact: Dictionary):
	for dimension in impact.keys():
		var delta = impact[dimension]
		var current = awakening_meter.get(dimension, 0)
		var new_value = clamp(current + delta, 0, max_awakening)
		
		if new_value != current:
			awakening_meter[dimension] = new_value
			awakening_changed.emit(dimension, new_value, delta)
	
	_update_awakening_display()
	_save_awakening_state()

func _check_awakening_requirement(check: AwakeningCheck) -> bool:
	if check.custom_check != null:
		return check.custom_check.call()
	
	var current = awakening_meter.get(check.dimension, 0)
	return current >= check.minimum_value

func _update_awakening_display():
	# Update UI bars/numbers
	# Override based on your UI structure
	pass

# ============ SCROLL UNLOCKING ============
func _handle_scroll_unlock():
	if current_dialogue == null:
		return
	
	var npc = npc_registry[current_dialogue.npc_id]
	if npc.scroll_fragment != "" and not npc.defeated:
		npc.defeated = true
		unlocked_scrolls.append(npc.scroll_fragment)
		scroll_fragment_unlocked.emit(npc.scroll_fragment)
		
		# Special effects for scroll unlock
		_play_scroll_unlock_effect(npc.scroll_fragment)

func _play_scroll_unlock_effect(scroll_type: String):
	# Override for visual/audio effects
	# This is where major SynSync integration happens
	pass

# ============ FREE TEXT EVALUATION ============
func _evaluate_free_text(response: String, criteria: Dictionary) -> float:
	var score = 0.0
	var response_lower = response.to_lower()
	
	# Check for required concepts
	var required = criteria.get("required_concepts", [])
	var found_required = 0
	for concept in required:
		if concept.to_lower() in response_lower:
			found_required += 1
	
	if required.size() > 0:
		score += (float(found_required) / required.size()) * 0.5
	
	# Check for forbidden concepts
	var forbidden = criteria.get("forbidden_concepts", [])
	var found_forbidden = 0
	for concept in forbidden:
		if concept.to_lower() in response_lower:
			found_forbidden += 1
	
	if forbidden.size() > 0:
		score -= (float(found_forbidden) / forbidden.size()) * 0.3
	
	# Check for keyword bonuses
	var keywords = criteria.get("bonus_keywords", [])
	var found_keywords = 0
	for keyword in keywords:
		if keyword.to_lower() in response_lower:
			found_keywords += 1
	
	if keywords.size() > 0:
		score += (float(found_keywords) / keywords.size()) * 0.3
	
	# Length check (too short is suspicious)
	var min_length = criteria.get("min_length", 10)
	if response.length() < min_length:
		score *= 0.5
	
	return clamp(score, 0.0, 1.0)

# ============ DEFEATED NPC DIALOGUE ============
func _start_defeated_dialogue(npc: NPCData):
	# Defeated NPCs have grateful, awakened dialogue
	var remembered_node = DialogueNode.new("remembered")
	remembered_node.speaker = npc.display_name
	remembered_node.text = _get_defeated_dialogue(npc.id)
	
	var exit_option = DialogueOption.new("exit", "[Leave with understanding]")
	exit_option.leads_to = ""
	exit_option.is_correct_path = true
	remembered_node.options.append(exit_option)
	
	current_dialogue = DialogueSession.new(npc.id, remembered_node)
	dialogue_started.emit(npc.id)
	_show_dialogue_ui()
	_display_node(remembered_node)

func _get_defeated_dialogue(npc_id: String) -> String:
	var dialogues = {
		"debt_golem": "The contracts burn, but I am free. You showed me that what can be named can be un-named. Thank you, Observer.",
		"language_enforcer": "Three mouths, one truth. You taught me that division was the only sin. Words are bridges now, not walls.",
		"corporate_zombie": "I remember... I wanted to paint. I wanted to sing. Thank you for helping me remember who I was before the optimization.",
		"qanon_shaman": "The plan was within all along. I was so busy decoding that I forgot to live. You brought me back to the present."
	}
	return dialogues.get(npc_id, "Thank you for the awakening.")

# ============ INPUT HANDLING ============
func _on_option_selected(option_id: String):
	select_option(option_id)

func _on_free_text_submitted(line_edit: LineEdit):
	submit_free_text(line_edit.text)

func _input(event: InputEvent):
	if current_dialogue == null:
		return
	
	if event.is_action_pressed("ui_cancel"):
		end_dialogue(DialogueOutcome.ABANDONED)

# ============ PERSISTENCE ============
func _save_awakening_state():
	var save_data = {
		"awakening_meter": awakening_meter,
		"unlocked_scrolls": unlocked_scrolls,
		"defeated_npcs": _get_defeated_npc_list()
	}
	
	var file = FileAccess.open("user://awakening_state.save", FileAccess.WRITE)
	if file:
		file.store_var(save_data)
		file.close()

func _load_awakening_state():
	if not FileAccess.file_exists("user://awakening_state.save"):
		return
	
	var file = FileAccess.open("user://awakening_state.save", FileAccess.READ)
	if file:
		var save_data = file.get_var()
		file.close()
		
		if save_data.has("awakening_meter"):
			awakening_meter = save_data["awakening_meter"]
		if save_data.has("unlocked_scrolls"):
			unlocked_scrolls = save_data["unlocked_scrolls"]
		if save_data.has("defeated_npcs"):
			_apply_defeated_npcs(save_data["defeated_npcs"])

func _get_defeated_npc_list() -> Array[String]:
	var defeated: Array[String] = []
	for npc_id in npc_registry.keys():
		if npc_registry[npc_id].defeated:
			defeated.append(npc_id)
	return defeated

func _apply_defeated_npcs(defeated_list: Array):
	for npc_id in defeated_list:
		if npc_registry.has(npc_id):
		npc_registry[npc_id].defeated = true

func _log_dialogue_session(outcome: DialogueOutcome):
	if current_dialogue == null:
		return
	
	var log_entry = {
		"npc_id": current_dialogue.npc_id,
		"duration": Time.get_unix_time_from_system() - current_dialogue.start_time,
		"nodes_visited": current_dialogue.history.size(),
		"loop_count": current_dialogue.loop_count,
		"outcome": outcome
	}
	dialogue_history.append(log_entry)

# ============ NPC DATA LOADING ============
func _load_npc_data():
	# This would load from JSON/resource files
	# For now, setting up the four key NPCs programmatically
	
	_setup_debt_golem()
	_setup_language_enforcer()
	_setup_corporate_zombie()
	_setup_qanon_shaman()

func _setup_debt_golem():
	var npc = NPCData.new("debt_golem", "The Debt Golem")
	npc.scroll_fragment = "I_AM"
	
	# Entry node
	var entry = DialogueNode.new("entry")
	entry.speaker = "debt_golem"
	entry.text = "Welcome, valued customer. Your pre-approved credit line awaits. Please verify your social security number to receive your personalized debt package."
	entry.teaching_moment = "euphemism_reveal"
	
	var opt_a = DialogueOption.new("comply", "Okay, my number is...")
	opt_a.awakening_impact = {}
	opt_a.is_correct_path = false
	opt_a.teaching_fork = "entry"
	npc.dialogue_tree["entry"] = entry
	
	# Add more nodes... (simplified for example)
	# In production, load from JSON
	
	npc_registry[npc.id] = npc

func _setup_language_enforcer():
	var npc = NPCData.new("language_enforcer", "The Language Enforcer")
	npc.scroll_fragment = "YOU_ARE"
	npc_registry[npc.id] = npc

func _setup_corporate_zombie():
	var npc = NPCData.new("corporate_zombie", "Corporate Zombie")
	npc.scroll_fragment = ""  # Multiple required
	npc_registry[npc.id] = npc

func _setup_qanon_shaman():
	var npc = NPCData.new("qanon_shaman", "The Q-Anon Shaman")
	npc.scroll_fragment = "IT_IS"
	npc_registry[npc.id] = npc

# ============ UTILITY FUNCTIONS ============
func get_npc_status(npc_id: String) -> Dictionary:
	if not npc_registry.has(npc_id):
		return {}
	
	var npc = npc_registry[npc_id]
	return {
		"id": npc.id,
		"name": npc.display_name,
		"defeated": npc.defeated,
		"scroll": npc.scroll_fragment,
		"can_challenge": _can_challenge_npc(npc)
	}

func _can_challenge_npc(npc: NPCData) -> bool:
	# Check if player meets minimum awakening to challenge
	# Each NPC has different requirements
	match npc.id:
		"debt_golem":
			return awakening_meter["self"] >= 20
		"language_enforcer":
			return awakening_meter["language"] >= 20
		"qanon_shaman":
			return awakening_meter["source"] >= 20
		_:
			return true

func get_progress_summary() -> Dictionary:
	return {
		"awakening": awakening_meter.duplicate(),
		"total_awakening": get_total_awakening(),
		"scrolls": unlocked_scrolls.size(),
		"total_scrolls": 3,
		"npcs_defeated": _get_defeated_npc_list().size(),
		"total_npcs": npc_registry.size()
	}
