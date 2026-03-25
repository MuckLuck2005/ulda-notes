#!/bin/sh
cd "$(dirname "$0")/../.."
npm install
npm run check
npm run prod:preview
