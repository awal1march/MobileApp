[app]

# (str) Title of your application
title = VTU Bundle App

# (str) Package name
package.name = vtubundle

# (str) Package domain (reverse DNS style)
package.domain = com.yourdomain

# (str) Source code where main.py is located
source.dir = .

# (str) Main entry point
source.main = main.py

# (list) Requirements
requirements = python3,kivy,requests,threading

# (str) Icon of your app
icon.filename = %(source.dir)s/icon.png

# (str) Supported orientation (portrait/landscape)
orientation = portrait

# (bool) Fullscreen
fullscreen = 0

# (list) Android permissions
android.permissions = INTERNET,ACCESS_NETWORK_STATE

# (list) Supported Android SDK versions
android.api = 33
android.minapi = 21
android.ndk = 25b

# (bool) Copy assets folder
# assets: images, sounds etc.
android.copy_assets = True

# (str) Presplash image
presplash.filename = %(source.dir)s/presplash.png

# (str) Target Android version
android.arch = arm64-v8a

# (bool) Use Python3 only
android.use_python3 = True
