#!/usr/bin/osascript
on run argv
    if (count of argv) is not 1 then
        error "Usage: trigger-action.scpt <actionName>" number 64
    end if

    set actionName to item 1 of argv as string
    if actionName is "" then error "Action name must not be empty." number 64
    set allowedCharacters to "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
    repeat with actionCharacter in characters of actionName
        if allowedCharacters does not contain (actionCharacter as string) then
            error "Action name must contain only letters, digits, or underscores." number 64
        end if
    end repeat

    set eventName to "commandcenter:action:" & actionName
    tell application "Brave Browser"
        activate
        tell active tab of front window
            execute javascript "window.dispatchEvent(new CustomEvent('" & eventName & "'));"
        end tell
    end tell
end run
