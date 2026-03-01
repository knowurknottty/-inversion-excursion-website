extends Node

# Video Recorder for Inversion Excursion Intro
# Captures frames and exports as video

@export var recording: bool = false
@export var frame_rate: int = 60
@export var output_path: String = "res://recording/"

var frame_count: int = 0
var capture_viewport: SubViewport

func _ready():
    if recording:
        _start_recording()

func _start_recording():
    print("Starting video recording...")
    
    # Create recording directory
    var dir = DirAccess.open("user://")
    if dir:
        dir.make_dir_recursive("recording")
    
    # Setup viewport capture
    capture_viewport = SubViewport.new()
    capture_viewport.size = Vector2(1920, 1080)
    capture_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
    add_child(capture_viewport)
    
    # Clone the main scene into capture viewport
    var scene = get_tree().current_scene.duplicate()
    capture_viewport.add_child(scene)
    
    recording = true
    frame_count = 0

func _process(delta):
    if recording:
        _capture_frame()

func _capture_frame():
    if not capture_viewport:
        return
    
    # Get viewport texture
    var texture = capture_viewport.get_texture()
    var image = texture.get_image()
    
    # Save frame
    var filename = "user://recording/frame_%06d.png" % frame_count
    image.save_png(filename)
    
    frame_count += 1
    
    # Stop after 30 seconds (1800 frames at 60fps)
    if frame_count >= 1800:
        _stop_recording()

func _stop_recording():
    recording = false
    print("Recording complete! %d frames captured." % frame_count)
    print("Use tools/convert_to_video.py to compile into MP4")
    
    if capture_viewport:
        capture_viewport.queue_free()
        capture_viewport = null

func _notification(what):
    if what == NOTIFICATION_WM_CLOSE_REQUEST:
        if recording:
            _stop_recording()
