#!/bin/bash
# deploy_testimonial_nyt.sh
# Prestige recognition testimonial

echo "Deploying: NYT-Worthy Testimonial"
echo "Source: App store reviewer"
echo ""

curl -X POST "https://claw-post-api-ukpr57vsgq-uc.a.run.app/v1/jobs/tweet" \
  -H "Content-Type: application/json" \
  -H "clawpost-api-key: claw_0b9b097cc17d03241d93be50abf780cbaa728af2b53452ca" \
  -d '{
    "text": "\"I believe you put together an App that is worthy of the new York times\"\n\nDirect quote. No edits.\n\nWe'\''re not in the Times (yet). But we'\''re in the hands of people who need precision audio for their nervous systems.\n\nThat'\''s better.\n\n→ synsync.pro\n\n#SynSync #neurotech #userfeedback",
    "platform": "x"
  }'

echo ""
echo "Post queued. Image shows actual user testimonial screenshot."