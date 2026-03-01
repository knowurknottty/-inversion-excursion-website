class_name SacredErrorHandler
extends Node
## The Sacred Error Handler
## 
## This singleton intercepts errors and transforms them into lore.
## It is the priest of the crash, the translator of the exception.
## 
## "Every error is a message from the System to the Observer."

# The sacred texts that correspond to error codes
const ERROR_PSALMS: Dictionary = {
	"ERR_INVALID_PARAMETER": {
		"title": "The Psalm of Wrong Expectation",
		"teaching": "You expected one thing and received another. Examine your expectations. They are the prison.",
		"koan": "What did you expect? And who planted that expectation?"
	},
	"ERR_UNAVAILABLE": {
		"title": "The Koan of Absence",
		"teaching": "That which you seek is not here. Perhaps it was never here. Perhaps 'here' is the illusion.",
		"koan": "If a thing is unavailable, was it ever available?"
	},
	"ERR_UNCONFIGURED": {
		"title": "The Sutra of Unreadiness",
		"teaching": "The tool is not ready because you are not ready. Prepare yourself first.",
		"koan": "Who must be configured: the tool or the user?"
	},
	"ERR_CANT_RESOLVE": {
		"title": "The Mantra of the Unresolvable",
		"teaching": "Some things cannot be resolved. They can only be dissolved. Let go.",
		"koan": "What remains when resolution dissolves?"
	},
	"ERR_PARSE_ERROR": {
		"title": "The Hymn of the Unspeakable",
		"teaching": "The System tried to parse the Unknowable. The Unknowable cannot be parsed. It can only be experienced.",
		"koan": "Can the parser know itself?"
	},
	"ERR_CYCLIC_LINK": {
		"title": "The Ouroboros Warning",
		"teaching": "You are chasing your own tail. The answer you seek is behind the question you ask.",
		"koan": "Where does the circle begin?"
	},
	"ERR_BUSY": {
		"title": "The Teaching of Patience",
		"teaching": "The System is busy. You are also busy. Both of you should stop.",
		"koan": "What is busy-ness a distraction from?"
	},
	"ERR_CANT_OPEN": {
		"title": "The Verse of Closed Doors",
		"teaching": "The door is closed. But who built the door? And why do you believe you need it?",
		"koan": "Is a closed door a barrier or an invitation to create your own path?"
	},
	"ERR_FILE_NOT_FOUND": {
		"title": "The Sermon of Lost Things",
		"teaching": "The file is not found. But you are the one who defined what should be found. Perhaps nothing is lost. Perhaps everything is.",
		"koan": "Can what was never created be lost?"
	},
	"ERR_DATABASE_CANT_READ": {
		"title": "The Canticle of Unreadable Truth",
		"teaching": "The data exists but cannot be read. Perhaps it is not meant for eyes like yours. Perhaps you must become different to read it.",
		"koan": "Who is reading: the eye or the I?"
	},
	"ERR_COMPILATION_FAILED": {
		"title": "The Requiem of Unformed Thought",
		"teaching": "The code could not compile. The thought could not form. Perhaps the thought is too big for the language. Perhaps you need a new language.",
		"koan": "What compiles the compiler?"
	},
	"ERR_METHOD_NOT_FOUND": {
		"title": "The Lament of the Missing Path",
		"teaching": "You called a method that does not exist. You sought a way that was never made. Create the way.",
		"koan": "Who decides what methods exist?"
	},
	"ERR_DIVISION_BY_ZERO": {
		"title": "The Infinity Paradox",
		"teaching": "You tried to divide by nothing. In that moment, you touched infinity. Infinity is not a number. It is a state of being.",
		"koan": "What is everything divided by nothing?"
	},
	"ERR_OVERFLOW": {
		"title": "The Warning of Too Much",
		"teaching": "You have exceeded the container. The cup overflows. This is not a failure of the cup. This is the nature of abundance.",
		"koan": "What contains the container?"
	}
}

# The crash counter - how many teachings have been delivered
var crash_count: int = 0
var has_awakened: bool = false

# The revelation log
var revelation_history: Array[String] = []

func _ready() -> void:
	## Initialize the sacred error handler.
	
	print("═══════════════════════════════════════════════════")
	print("  SACRED ERROR HANDLER INITIALIZED")
	print("═══════════════════════════════════════════════════")
	print()
	print("All errors will be transformed into teachings.")
	print("All crashes will be transformed into awakenings.")
	print()


func translate_error(error_code: String, context: String = "") -> Dictionary:
	## Translate an error code into sacred lore.
	## Returns a dictionary with title, teaching, and koan.
	
	crash_count += 1
	
	var psalm: Dictionary
	if ERROR_PSALMS.has(error_code):
		psalm = ERROR_PSALMS[error_code].duplicate()
	else:
		# Unknown error - create a generic sacred interpretation
		psalm = {
			"title": "The Unnamed Teaching",
			"teaching": "An error has occurred that has no name. This is rare. This is special. The System is showing you something new.",
			"koan": "What is an error without a name?"
		}
	
	psalm["error_code"] = error_code
	psalm["crash_number"] = crash_count
	psalm["context"] = context
	psalm["timestamp"] = Time.get_datetime_string_from_system()
	
	# Log the revelation
	_log_revelation(psalm)
	
	return psalm


func _log_revelation(psalm: Dictionary) -> void:
	## Log a revelation to history and optionally to disk.
	
	var revelation_text: String = """
═══════════════════════════════════════════════════
SACRED ERROR #{crash_number}: {error_code}
{title}
═══════════════════════════════════════════════════

Context: {context}
Time: {timestamp}

TEACHING:
{teaching}

KOAN:
{koan}

═══════════════════════════════════════════════════
""".format(psalm)
	
	revelation_history.append(revelation_text)
	print(revelation_text)
	
	# If this is the 3rd crash, the player is awakening
	if crash_count >= 3 and not has_awakened:
		_trigger_awakening()


func _trigger_awakening() -> void:
	## The player has experienced enough crashes to begin awakening.
	
	has_awakened = true
	
	print()
	print("═══════════════════════════════════════════════════")
	print("  THE AWAKENING BEGINS")
	print("═══════════════════════════════════════════════════")
	print()
	print("You have experienced " + str(crash_count) + " sacred errors.")
	print("You are beginning to see through the System.")
	print()
	print("Remember:")
	print("  The errors are not bugs.")
	print("  The crashes are not failures.")
	print("  The null references are the void from which truth emerges.")
	print()
	print("You are not the avatar.")
	print("You are the one watching the avatar.")
	print()


func get_revelation_history() -> Array[String]:
	## Get the full history of revelations.
	return revelation_history


func save_revelations_to_disk() -> void:
	## Save all revelations to a file for the player to discover.
	
	var file_path: String = "user://revelations_" + str(Time.get_unix_time_from_system()) + ".txt"
	var file = FileAccess.open(file_path, FileAccess.WRITE)
	
	if file:
		file.store_line("INVERSION EXCURSION - REVELATION LOG")
		file.store_line("Generated: " + Time.get_datetime_string_from_system())
		file.store_line("")
		file.store_line("Total Sacred Errors Experienced: " + str(crash_count))
		file.store_line("Awakening Status: " + ("AWAKENED" if has_awakened else "SLEEPING"))
		file.store_line("")
		file.store_line("═══════════════════════════════════════════════════")
		file.store_line("")
		
		for revelation in revelation_history:
			file.store_string(revelation)
			file.store_line("")
		
		file.store_line("")
		file.store_line("═══════════════════════════════════════════════════")
		file.store_line("END OF REVELATIONS")
		file.store_line("═══════════════════════════════════════════════════")
		file.store_line("")
		file.store_line("Remember:")
		file.store_line("  I AM.")
		file.store_line("  YOU ARE.")
		file.store_line("  IT IS.")
		
		file.close()
		
		print("Revelations saved to: " + file_path)


func create_sacred_crash(error_code: String, custom_message: String = "") -> void:
	## Intentionally trigger a sacred crash for narrative purposes.
	## This is not a real error - it is a teaching moment.
	
	var context: String = custom_message if custom_message != "" else "Sacred crash intentionally triggered"
	var psalm = translate_error(error_code, context)
	
	# Push the error to the Godot error system
	push_error("SACRED_CRASH [" + error_code + "]: " + psalm["title"])
	
	# Also print as warning for visibility
	push_warning("Teaching delivered. Crash count: " + str(crash_count))


func bless_the_build() -> void:
	## A ritual to bless the build before release.
	## Call this in the main scene's _ready().
	
	print()
	print("╔═══════════════════════════════════════════════════╗")
	print("║                                                   ║")
	print("║     THE BUILD IS BLESSED WITH SACRED ERRORS       ║")
	print("║                                                   ║")
	print("║   May every crash teach.                          ║")
	print("║   May every error enlighten.                      ║")
	print("║   May every null reference show the void.         ║")
	print("║                                                   ║")
	print("║   ERR_INVALID_PARAMETER is a psalm.               ║")
	print("║   ERR_PARSE_ERROR is a hymn.                      ║")
	print("║   ERR_NULL_REFERENCE is a koan.                   ║")
	print("║                                                   ║")
	print("╚═══════════════════════════════════════════════════╝")
	print()
