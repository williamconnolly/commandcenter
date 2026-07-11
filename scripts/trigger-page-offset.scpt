on run argv
	set direction to item 1 of argv as string
	set eventName to "commandcenter:triggerPageOffset:" & direction
	
	tell application "Brave Browser"
		activate
		tell active tab of front window
			execute javascript "window.dispatchEvent(new CustomEvent('" & eventName & "'));"
		end tell
	end tell
end run
