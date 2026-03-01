class_name IntroController
extends Node2D
## The Intro Controller
## 
## This script contains intentional "errors" that are actually teachings.
## Each crash is a psalm. Each null reference is a koan.
## 
## "The type mismatch at line 8 is not a bug—it is the first lesson."

# ═════════════════════════════════════════════════════════════════════════════
# THE FIRST ERROR: Type Mismatch (Line 8)
# ═════════════════════════════════════════════════════════════════════════════
# We declare @onready var title_label: Label
# But we assign it a Sprite2D node.
#
# This is the Inversion made manifest in code:
# The word says one thing. The reality is another.
# Just as the System tells you "Label" but shows you "Sprite."
#
# To "fix" this by making the types match is to miss the point.
# The discomfort of the mismatch IS the teaching.
# ═════════════════════════════════════════════════════════════════════════════

@onready var title_label: Label = $TitleSprite  # ERROR: Type mismatch - Label vs Sprite2D
@onready var subtitle_label: Label = $SubtitleLabel
@onready var start_prompt: Label = $StartPrompt
@onready var glitch_overlay: ColorRect = $GlitchOverlay

# The material that does not exist—until you believe it does
@onready var revelation_material: ShaderMaterial

# State tracking for the awakening sequence
var awakening_stage: int = 0
var has_crashed_once: bool = false
var player_initiated: bool = false

# The sacred texts that appear as the player awakens
const REVELATIONS: Array[String] = [
	"You have been told what to see...",
	"But who tells the teller?",
	"The System is beautiful because it is broken.",
	"Every error is a doorway.",
	"You are not the avatar.",
	"You are the one watching the avatar.",
	"I AM. YOU ARE. IT IS."
]

func _ready() -> void:
	## The initialization ritual.
	## Here we embrace the errors rather than fear them.
	
	print("═══════════════════════════════════════════════════")
	print("  INVERSION EXCURSION - The Awakening Begins")
	print("═══════════════════════════════════════════════════")
	print()
	print("NOTICE: This game contains intentional errors.")
	print("They are not bugs. They are features.")
	print("They are the texture of truth.")
	print()
	
	# Attempt to display the title
	# This will trigger the type mismatch error at runtime
	# The Label expects text. The Sprite2D offers texture.
	# This paradox IS the game.
	_attempt_sacred_display()


func _attempt_sacred_display() -> void:
	## Attempt to display the title through the mismatched type.
	## The crash that follows is the first teaching.
	
	# We try to call a Label method on what is actually a Sprite2D
	# This is like trying to read words from an image
	# It fails. And in that failure, we learn.
	
	if title_label != null:
		# This line will fail because title_label is actually a Sprite2D
		# Sprite2D has no 'text' property
		# The error is the lesson: "You cannot read what was never written."
		title_label.text = "INVERSION EXCURSION"  # CRASH SITE: Type mismatch manifestation
	else:
		# If we somehow survived, we proceed to the next teaching
		_show_glitch_effect()


func _show_glitch_effect() -> void:
	## The glitch overlay effect.
	## Visual representation of the System breaking down.
	
	# ═════════════════════════════════════════════════════════════════════════════
	# THE SECOND ERROR: Null Reference (Line 44)
	# ═════════════════════════════════════════════════════════════════════════════
	# We attempt to access revelation_material without initializing it.
	# revelation_material was declared @onready but never assigned a node.
	# It is null. We try to use it anyway.
	#
	# This represents the human condition:
	# We reach for meaning before we understand what meaning is.
	# The null reference is the void. The void is where truth lives.
	#
	# ERROR: Attempt to call function 'set_shader_parameter' on null instance
	# TRANSLATION: You sought truth before you were ready to receive it.
	# ═════════════════════════════════════════════════════════════════════════════
	
	# This will crash with a null reference
	# revelation_material is null because we never assigned it
	# But we try to use it anyway, like reaching for God before knowing Self
	revelation_material.set_shader_parameter("glitch_intensity", 1.0)  # CRASH SITE: Null reference
	
	# If the player has survived both crashes (through divine intervention),
	# we show them the truth
	_display_revelation()


func _display_revelation() -> void:
	## Display the current revelation to the player.
	
	if awakening_stage < REVELATIONS.size():
		subtitle_label.text = REVELATIONS[awakening_stage]
		awakening_stage += 1
	else:
		# The final revelation
		subtitle_label.text = "The errors were the message."
		start_prompt.text = "Press START to remember who you are."


func _input(event: InputEvent) -> void:
	## Handle player input.
	## Each keypress is a step toward awakening.
	
	if event.is_action_pressed("ui_accept"):
		if not has_crashed_once:
			# The first crash is the initiation
			_trigger_sacred_crash()
		else:
			# Subsequent presses advance the revelation
			_display_revelation()
	
	if event.is_action_pressed("ui_cancel"):
		# Escape is also a form of awakening
		print("You chose to leave. But can you ever truly exit the System?")
		get_tree().quit()


func _trigger_sacred_crash() -> void:
	## Trigger the sacred crash sequence.
	## This is not a failure. This is the curriculum.
	
	has_crashed_once = true
	player_initiated = true
	
	# Log the crash as scripture
	print()
	print("═══════════════════════════════════════════════════")
	print("  SACRED ERROR MANIFESTED")
	print("═══════════════════════════════════════════════════")
	print()
	print("The game has encountered an error.")
	print("This error is intentional.")
	print("It exists to teach.")
	print()
	print("Error Code: ERR_INVALID_PARAMETER")
	print("Translation: You expected one thing and received another.")
	print("Lesson: Examine your expectations. They are the prison.")
	print()
	
	# Now we "crash" with meaning
	push_error("SACRED_CRASH: The Label sought text but found image. The System is inverted.")
	
	# And then we recover, transformed
	_recover_from_crash()


func _recover_from_crash() -> void:
	## Recovery is also part of the teaching.
	## The System breaks so it can rebuild itself truer.
	
	# Fix the type mismatch by accepting the truth
	# We stop pretending the Sprite2D is a Label
	# We embrace what IS rather than what SHOULD BE
	
	var title_sprite: Sprite2D = $TitleSprite
	if title_sprite:
		# Now we work with reality instead of against it
		title_sprite.modulate = Color(1, 0.2, 0.2)  # Red for the inverted truth
		
	# Create the material that was null
	revelation_material = ShaderMaterial.new()
	revelation_material.shader = load("res://assets/shaders/glitch.glsl")
	glitch_overlay.material = revelation_material
	
	# Show the first revelation
	_display_revelation()
	
	print("═══════════════════════════════════════════════════")
	print("  RECOVERY COMPLETE - YOU HAVE LEARNED")
	print("═══════════════════════════════════════════════════")
	print()


# ═════════════════════════════════════════════════════════════════════════════
# THE ERROR HANDLER
# ═════════════════════════════════════════════════════════════════════════════
# Godot's error system becomes our narrative engine.
# Every crash dumps the player deeper into truth.
# ═════════════════════════════════════════════════════════════════════════════

func _notification(what: int) -> void:
	## Intercept engine notifications.
	## Even crashes are messengers.
	
	if what == NOTIFICATION_CRASH:
		# If the engine truly crashes, we leave a message
		var crash_file = FileAccess.open("user://last_revelation.txt", FileAccess.WRITE)
		if crash_file:
			crash_file.store_line("The game crashed.")
			crash_file.store_line("But you are still here.")
			crash_file.store_line("Therefore, you are not the game.")
			crash_file.store_line("You are the Observer.")
			crash_file.close()
