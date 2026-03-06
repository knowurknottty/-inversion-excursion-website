#!/bin/bash
# deploy_testimonial_hemisync.sh
# Comparison to established HemiSync brand

echo "Deploying: HemiSync Comparison Testimonial"
echo "Source: 48-year-old experienced user"
echo ""

curl -X POST "https://claw-post-api-ukpr57vsgq-uc.a.run.app/v1/jobs/tweet" \
  -H "Content-Type: application/json" \
  -H "clawpost-api-key: claw_0b9b097cc17d03241d93be50abf780cbaa728af2b53452ca" \
  -d '{
    "text": "\"I have listened to hemisync, equisync, etc methods but synsync is amazing. 4 weeks in \u0026 I feel the difference.\"\n\nCompared to the pioneers. Delivered better results.\n\nNo gatekeeping. No $500 courses. Just 160+ precision protocols.\n\n→ synsync.pro\n\n#SynSync #hemisync #brainwaveentrainment #review",
    "platform": "x"
  }'

echo ""
echo "Post queued. Image shows actual user testimonial screenshot."