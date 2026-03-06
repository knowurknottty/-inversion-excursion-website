extends Node2D

# INVERSION EXCURSION - PS5 FIDELITY INTRO CONTROLLER
# 22-second cinematic spiritual awakening sequence

# Scene containers
@onready var snes_boot: Control = $SNESBoot
@onready var title_reveal: Control = $TitleReveal
@onready var the_question: Control = $TheQuestion
@onready var the_pondering: Control = $ThePondering
@onready var spiral_vortex: ColorRect = $SpiralVortex
@onready var title_screen: Control = $TitleScreen

# Text elements
@onready var title_text: Label = $TitleReveal/TitleText
@onready var subtitle: Label = $TitleReveal/Subtitle
@onready var question_text: Label = $TheQuestion/QuestionText
@onready var pondering_text: Label = $ThePondering/PonderingText
@onready var press_start: Label = $TitleScreen/PressStart

# Visual elements
@onready var character: Sprite2D = $TheQuestion/Character
@onready var character_pondering: Sprite2D = $ThePondering/Character

# Audio
@onready var music_player: AudioStreamPlayer = $MusicPlayer
@onready var sfx_player: AudioStreamPlayer = $SFXPlayer
@onready var voice_player: AudioStreamPlayer = $VoicePlayer

# Shader materials
var spiral_material: ShaderMaterial

# Intro phases
enum Phase {
	SNES_BOOT,
	CARTRIDGE_INSERT,
	TITLE_REVEAL,
	THE_QUESTION,
	THE_PONDERING,
	THE_SPIRAL,
	TITLE_SCREEN
}

var current_phase: Phase = Phase.SNES_BOOT

func _ready():
	# Get spiral shader material
	if spiral_vortex != null and spiral_vortex.material != null:
		spiral_material = spiral_vortex.material as ShaderMaterial
	
	# Hide all phases initially
	_hide_all_phases()
	
	# Start sequence
	_start_intro()
	
	print("=== INVERSION EXCURSION ===")
	print("PS5 Fidelity Intro Sequence Started")
	print("Resolution: 1920x1080 | Renderer: Forward+")

func _hide_all_phases():
	snes_boot.visible = true
	snes_boot.modulate.a = 1.0
	title_reveal.visible = false
	the_question.visible = false
	the_pondering.visible = false
	spiral_vortex.visible = false
	title_screen.visible = false

func _start_intro():
	# Phase 1: SNES Boot (0-3s)
	await get_tree().create_timer(3.0).timeout
	_transition_to_phase(Phase.CARTRIDGE_INSERT)

func _transition_to_phase(new_phase: Phase):
	current_phase = new_phase
	
	match new_phase:
		Phase.CARTRIDGE_INSERT:
			_play_cartridge_insert()
		Phase.TITLE_REVEAL:
			_play_title_reveal()
		Phase.THE_QUESTION:
			_play_the_question()
		Phase.THE_PONDERING:
			_play_the_pondering()
		Phase.THE_SPIRAL:
			_play_the_spiral()
		Phase.TITLE_SCREEN:
			_play_title_screen()

func _play_cartridge_insert():
	# Flash transition
	var flash = ColorRect.new()
	flash.color = Color.WHITE
	flash.size = Vector2(1920, 1080)
	add_child(flash)
	
	var tween = create_tween()
	tween.tween_property(flash, "color:a", 0.0, 0.15).from(1.0)
	tween.tween_callback(flash.queue_free)
	
	# Fade out SNES boot
	var fade_tween = create_tween()
	fade_tween.tween_property(snes_boot, "modulate:a", 0.0, 0.3)
	await fade_tween.finished
	snes_boot.visible = false
	
	await get_tree().create_timer(0.5).timeout
	_transition_to_phase(Phase.TITLE_REVEAL)

func _play_title_reveal():
	title_reveal.visible = true
	title_reveal.modulate.a = 0.0
	
	# Dramatic fade in with scale
	title_text.scale = Vector2(0.9, 0.9)
	
	var tween = create_tween()
	tween.set_parallel()
	tween.tween_property(title_reveal, "modulate:a", 1.0, 2.0)
	tween.tween_property(title_text, "scale", Vector2(1.0, 1.0), 2.0).set_trans(Tween.TRANS_EXPO).set_ease(Tween.EASE_OUT)
	
	await get_tree().create_timer(2.5).timeout
	
	# Fade out
	var fade_tween = create_tween()
	fade_tween.tween_property(title_reveal, "modulate:a", 0.0, 0.5)
	await fade_tween.finished
	title_reveal.visible = false
	
	_transition_to_phase(Phase.THE_QUESTION)

func _play_the_question():
	the_question.visible = true
	the_question.modulate.a = 0.0
	
	# Fade in scene
	var tween = create_tween()
	tween.tween_property(the_question, "modulate:a", 1.0, 3.0)
	
	await get_tree().create_timer(2.0).timeout
	
	# Show question with dramatic reveal
	question_text.modulate.a = 0.0
	var text_tween = create_tween()
	text_tween.tween_property(question_text, "modulate:a", 1.0, 2.0)
	
	await get_tree().create_timer(5.0).timeout
	_transition_to_phase(Phase.THE_PONDERING)

func _play_the_pondering():
	# Crossfade to pondering scene
	the_pondering.visible = true
	the_pondering.modulate.a = 0.0
	
	var tween = create_tween()
	tween.set_parallel()
	tween.tween_property(the_question, "modulate:a", 0.0, 1.5)
	tween.tween_property(the_pondering, "modulate:a", 1.0, 1.5)
	
	await get_tree().create_timer(1.5).timeout
	the_question.visible = false
	
	# Show pondering text
	pondering_text.modulate.a = 0.0
	var text_tween = create_tween()
	text_tween.tween_property(pondering_text, "modulate:a", 1.0, 2.0)
	
	# Subtle character zoom
	var char_tween = create_tween()
	char_tween.tween_property(character_pondering, "scale", Vector2(1.8, 1.8), 4.0)
	
	await get_tree().create_timer(4.0).timeout
	_transition_to_phase(Phase.THE_SPIRAL)

func _play_the_spiral():
	# Transition to vortex
	spiral_vortex.visible = true
	spiral_vortex.modulate.a = 0.0
	
	var fade_tween = create_tween()
	fade_tween.set_parallel()
	fade_tween.tween_property(the_pondering, "modulate:a", 0.0, 1.0)
	fade_tween.tween_property(spiral_vortex, "modulate:a", 1.0, 1.0)
	
	await fade_tween.finished
	the_pondering.visible = false
	
	# Animate spiral progression
	var spiral_tween = create_tween()
	spiral_tween.tween_method(_update_spiral_progress, 0.0, 1.0, 6.0)
	
	await get_tree().create_timer(6.0).timeout
	_transition_to_phase(Phase.TITLE_SCREEN)

func _update_spiral_progress(value: float):
	if spiral_material:
		spiral_material.set_shader_parameter("progress", value)

func _play_title_screen():
	# Flash to title screen
	var flash = ColorRect.new()
	flash.color = Color.WHITE
	flash.size = Vector2(1920, 1080)
	add_child(flash)
	
	var flash_tween = create_tween()
	flash_tween.tween_property(flash, "color:a", 0.0, 1.0).from(1.0)
	flash_tween.tween_callback(flash.queue_free)
	
	spiral_vortex.visible = false
	title_screen.visible = true
	title_screen.modulate.a = 0.0
	
	var tween = create_tween()
	tween.tween_property(title_screen, "modulate:a", 1.0, 1.5)
	
	await tween.finished
	
	# Blink "PRESS START"
	var blink_tween = create_tween()
	blink_tween.set_loops()
	blink_tween.tween_property(press_start, "modulate:a", 0.3, 0.8)
	blink_tween.tween_property(press_start, "modulate:a", 1.0, 0.8)
	
	print("=== INTRO COMPLETE ===")
	print("Awaiting player input...")

func _input(event):
	if event.is_action_pressed("start_intro") and current_phase == Phase.TITLE_SCREEN:
		print("JOURNEY BEGINS...")
		# Would transition to main game here
		get_tree().reload_current_scene()
	
	if event.is_action_pressed("skip_intro"):
		get_tree().reload_current_scene()

func _process(_delta):
	# Subtle character breathing animation
	if current_phase == Phase.THE_QUESTION and character.visible:
		var breathe = sin(Time.get_time_dict_from_system()["second"] * 1.5) * 0.02 + 1.0
		character.scale = Vector2(1.5, 1.5) * breathe
