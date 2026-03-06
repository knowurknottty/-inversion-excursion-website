#!/bin/bash
# deploy_testimonial_anxiety.sh
# Anxiety relief discovery from TikTok

echo "Deploying: Anxiety Relief Testimonial"
echo "Source: TikTok discovery user"
echo ""

curl -X POST "https://claw-post-api-ukpr57vsgq-uc.a.run.app/v1/jobs/tweet" \
  -H "Content-Type: application/json" \
  -H "clawpost-api-key: claw_0b9b097cc17d03241d93be50abf780cbaa728af2b53452ca" \
  -d '{
    "text": "\"I stumbled upon your tiktok this morning and I tried out the anxiety frequency and I want you to know, your work is fruitful. It works amazingly.\"\n\nThis came in this morning. From someone who found us on TikTok.\n\nNo account required. No tracking. Just frequencies that work.\n\n→ synsync.pro\n\n#SynSync #anxietyrelief #testimonial",
    "platform": "x"
  }'

echo ""
echo "Post queued. Image shows actual user testimonial screenshot."