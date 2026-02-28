#!/usr/bin/env python3
"""
SHECKLE Twitter Bot - CLI Version
Direct Twitter API integration, no GUI needed
"""

import tweepy
import json
import sys
import os

# Twitter API Credentials (from /capt/twit)
CONSUMER_KEY = "Rh18QwaVkxFNGV8NxEwfDBlif"
CONSUMER_SECRET = "qlI7N2RtZM5XM7PYSLxCN8aOzRCOlZZZv3zKDoMS2twnDh67O2"
ACCESS_TOKEN = "1905802155975483392-54B0y693ksAziIc3PWQpB9Jktau0Bl"
ACCESS_TOKEN_SECRET = "c4UlSBjAFPpnffjc4pigsNb5OrTdf93V6PElyOChgwJXi"
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAGu67wEAAAAAx5xHVCTIyCpMKddP6SqYIAL14RE%3D0fMvfw3RlZqwYr3Z2bMRNstVbyYPXTNyd7ksgkNAke17kVwzGm"

class SheckleTwitterBot:
    def __init__(self):
        # Authenticate with Twitter API v2
        self.client = tweepy.Client(
            bearer_token=BEARER_TOKEN,
            consumer_key=CONSUMER_KEY,
            consumer_secret=CONSUMER_SECRET,
            access_token=ACCESS_TOKEN,
            access_token_secret=ACCESS_TOKEN_SECRET
        )
        
        # Authenticate for media uploads (v1.1 API)
        auth = tweepy.OAuth1UserHandler(
            CONSUMER_KEY, CONSUMER_SECRET,
            ACCESS_TOKEN, ACCESS_TOKEN_SECRET
        )
        self.api = tweepy.API(auth)
    
    def post_tweet(self, text):
        """Post a simple text tweet"""
        try:
            response = self.client.create_tweet(text=text)
            print(f"✅ Tweet posted!")
            print(f"ID: {response.data['id']}")
            print(f"URL: https://twitter.com/user/status/{response.data['id']}")
            return True
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def post_thread(self, tweets):
        """Post a thread of tweets"""
        try:
            previous_id = None
            for i, text in enumerate(tweets):
                if previous_id:
                    response = self.client.create_tweet(
                        text=text,
                        in_reply_to_tweet_id=previous_id
                    )
                else:
                    response = self.client.create_tweet(text=text)
                
                previous_id = response.data['id']
                print(f"✅ Tweet {i+1}/{len(tweets)} posted: {response.data['id']}")
            
            print(f"\n🧵 Thread complete!")
            print(f"First tweet: https://twitter.com/user/status/{tweets[0]}")
            return True
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def get_user_info(self):
        """Get authenticated user info"""
        try:
            user = self.client.get_me()
            print(f"User: @{user.data.username}")
            print(f"Name: {user.data.name}")
            print(f"ID: {user.data.id}")
            return user.data
        except Exception as e:
            print(f"❌ Error: {e}")
            return None

def main():
    bot = SheckleTwitterBot()
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 twitter_bot.py 'Single tweet text'")
        print("  python3 twitter_bot.py thread 'Tweet 1' 'Tweet 2' 'Tweet 3'")
        print("  python3 twitter_bot.py info")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "info":
        bot.get_user_info()
    
    elif command == "thread":
        if len(sys.argv) < 3:
            print("❌ Need at least 2 tweets for a thread")
            sys.exit(1)
        tweets = sys.argv[2:]
        bot.post_thread(tweets)
    
    else:
        # Single tweet
        text = " ".join(sys.argv[1:])
        bot.post_tweet(text)

if __name__ == "__main__":
    main()

