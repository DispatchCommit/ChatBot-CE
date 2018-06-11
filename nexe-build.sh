#!/bin/bash

echo -e "\t\t    ChatBot CE Build Script"
echo -e "\tBuilding for x64, x86 for Windows, Mac, and Linux\n\n"

mkdir -p ./dist/release

# Variables for all the platforms.
windows32=windows-x86-9.5.0
windows64=windows-x64-9.5.0
linux32=linux-x86-9.5.0
linux64=linux-x64-9.5.0
mac32=mac-x86-9.5.0
mac64=mac-x64-9.5.0

platforms=($linux64 $windows64)

for i in "${platforms[@]}"
do
   echo "Building for $i"
   nexe ./dist/chatbot-ce.js --bundle nexe-bundle.js --target=$i --output ./dist/release/ChatBotCE
   echo -e "\n"
done