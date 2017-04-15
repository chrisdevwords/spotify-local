on run
	set info to ""
	tell application "System Events"
		set num to count (every process whose name is "Spotify")
	end tell
	if num > 0 then
		tell application "Spotify"
			if player state is playing then
				set info to not shuffling
				set shuffling to not shuffling
			end if
		end tell
	end if
	return info
end run
