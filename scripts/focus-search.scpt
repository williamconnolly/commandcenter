on run
	set eventName to "commandcenter:focusSearch"
	tell application "Brave Browser"
		activate
		tell active tab of front window
			execute javascript "window.dispatchEvent(new CustomEvent('" & eventName & "'));"
		end tell
	end tell
end run