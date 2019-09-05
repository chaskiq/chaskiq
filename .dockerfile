# Ignore all logfiles and tempfiles.
/log/*
/tmp/*
/public/packs/*
!/log/.keep
!/tmp/.keep
.DS_Store
.idea
.env.development
.env.staging

# Ignore node_modules
/node_modules/*

# Ignore bundler config.
/.bundle

# Ignore the tags file used by VIM
tags

# Ignore Byebug command history file.
.byebug_history

# Ignore .git as it's not needed with the docker built.
.git
.cache