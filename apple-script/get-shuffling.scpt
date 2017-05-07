on run
  set info to ""
  tell application "System Events"
    set num to count (every process whose name is "Spotify")
  end tell
  if num > 0 then
    tell application "Spotify"
      set info to shuffling
    end tell
  end if
  return info
end run
