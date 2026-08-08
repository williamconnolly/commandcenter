on run argv
	set direction to item 1 of argv as string
	set eventName to "commandcenter:triggerPageOffset:" & direction
	
	tell application "Google Chrome"
		activate
		tell active tab of front window
			execute javascript "document.querySelector('.close-sidebar').click();"
		end tell
	end tell
end run
