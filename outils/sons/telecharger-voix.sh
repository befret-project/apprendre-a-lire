#!/bin/sh
# Télécharge le moteur Piper et la voix française utilisés pour générer sons.js (Linux x86_64).
set -e
cd "$(dirname "$0")"
curl -sL -o piper.tgz https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz && tar xzf piper.tgz && rm piper.tgz
curl -sL -o voix.tgz https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-fr-siwis-medium.tar.gz && tar xzf voix.tgz && rm voix.tgz
chmod +x piper/piper piper/espeak-ng
echo "OK : piper/ et fr-siwis-medium.onnx sont prêts."
