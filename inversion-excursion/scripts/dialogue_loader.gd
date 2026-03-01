class_name DialogueLoader
extends RefCounted

# INVERSION EXCURSION - DIALOGUE DATA LOADER
# Loads NPC dialogue trees from JSON files

const DIALOGUE_PATH = "res://data/dialogues/"

static func load_npc_dialogue(npc_id: String) -> Dictionary:
	var file_path = DIALOGUE_PATH + npc_id + ".json"
	
	if not FileAccess.file_exists(file_path):
		push_warning("Dialogue file not found: " + file_path)
		return {}
	
	var file = FileAccess.open(file_path, FileAccess.READ)
	if file == null:
		push_error("Failed to open dialogue file: " + file_path)
		return {}
	
	var json_text = file.get_as_text()
	file.close()
	
	var json = JSON.new()
	var error = json.parse(json_text)
	
	if error != OK:
		push_error("JSON parse error in " + file_path + ": " + json.get_error_message())
		return {}
	
	return json.data

static func build_dialogue_tree(npc_data: Dictionary) -> Dictionary:
	var tree = {}
	
	if not npc_data.has("nodes"):
		return tree
	
	for node_data in npc_data["nodes"]:
		var node = _parse_node(node_data)
		tree[node.id] = node
	
	return tree

static func _parse_node(data: Dictionary) -> DialogueSystem.DialogueNode:
	var node = DialogueSystem.DialogueNode.new(data.get("id", "unknown"))
	node.speaker = data.get("speaker", "")
	node.text = data.get("text", "")
	node.teaching_moment = data.get("teaching_moment", "")
	node.next_node = data.get("next_node", "")
	node.is_free_text = data.get("is_free_text", false)
	
	# Parse awakening check
	if data.has("awakening_check"):
		var check_data = data["awakening_check"]
		node.awakening_check = DialogueSystem.AwakeningCheck.new(
			check_data.get("dimension", "self"),
			check_data.get("minimum", 0)
		)
		node.awakening_check.pass_node = check_data.get("pass_node", "")
		node.awakening_check.fail_node = check_data.get("fail_node", "")
	
	# Parse free text evaluation
	if data.has("free_text_evaluation"):
		node.free_text_evaluation = data["free_text_evaluation"]
	
	# Parse options
	if data.has("options"):
		for opt_data in data["options"]:
			var option = _parse_option(opt_data)
			node.options.append(option)
	
	return node

static func _parse_option(data: Dictionary) -> DialogueSystem.DialogueOption:
	var option = DialogueSystem.DialogueOption.new(
		data.get("id", "opt_" + str(randi())),
		data.get("text", "...")
	)
	
	option.is_correct_path = data.get("is_correct", false)
	option.leads_to = data.get("leads_to", "")
	option.teaching_fork = data.get("teaching_fork", "")
	
	# Parse awakening impact
	if data.has("awakening_impact"):
		option.awakening_impact = data["awakening_impact"]
	
	return option

static func load_all_npcs() -> Dictionary:
	var npcs = {}
	
	var npc_ids = [
		"debt_golem",
		"language_enforcer", 
		"corporate_zombie",
		"qanon_shaman"
	]
	
	for npc_id in npc_ids:
		var data = load_npc_dialogue(npc_id)
		if not data.is_empty():
			npcs[npc_id] = data
	
	return npcs
