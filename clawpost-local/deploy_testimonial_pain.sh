#!/bin/bash
# deploy_testimonial_pain.sh
# Most powerful testimonial - gunshot trauma recovery

echo "Deploying: Pain Management Testimonial (Most Powerful)"
echo "Source: User recovering from gunshot trauma"
echo ""

curl -X POST "https://claw-post-api-ukpr57vsgq-uc.a.run.app/v1/jobs/tweet" \
  -H "Content-Type: application/json" \
  -H "clawpost-api-key: claw_0b9b097cc17d03241d93be50abf780cbaa728af2b53452ca" \
  -d '{
    "text": "\"3 years ago I got shot and it shattered my lower leg... frequencies help with the pain.\"\n\nThis is why we build.\n\nNot for the headlines.\nFor the person recovering from trauma who needs something that actually works.\n\n160+ protocols. Zero extraction.\n\n→ synsync.pro\n\n#SynSync #painmanagement #healing",
    "platform": "x"
  }'

echo ""
echo "Post queued. Image shows actual user testimonial screenshot."