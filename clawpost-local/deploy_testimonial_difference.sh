#!/bin/bash
# deploy_testimonial_difference.sh
# Daily habit formation testimonial

echo "Deploying: Daily Difference Testimonial"
echo "Source: Daily user"
echo ""

curl -X POST "https://claw-post-api-ukpr57vsgq-uc.a.run.app/v1/jobs/tweet" \
  -H "Content-Type: application/json" \
  -H "clawpost-api-key: claw_0b9b097cc17d03241d93be50abf780cbaa728af2b53452ca" \
  -d '{
    "text": "\"I can tell when I have listened... vs not listening. For the better.\"\n\nThe body knows. The difference is measurable.\n\n2 minutes. Any frequency. Zero side effects.\n\n→ synsync.pro\n\n#SynSync #biohacking #nervoussystem",
    "platform": "x"
  }'

echo ""
echo "Post queued. Image shows actual user testimonial screenshot."