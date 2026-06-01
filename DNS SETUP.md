# TherapyLog DNS Setup Guide

# Setting up therapylog.app with GitHub Pages

## After creating your GitHub repository and uploading these files:

### Step 1: Enable GitHub Pages

1. Go to your GitHub repository
1. Tap Settings (or ⚙️)
1. Scroll to “Pages” in the left sidebar
1. Under “Source” select: Deploy from a branch
1. Branch: main / (root)
1. Save

GitHub will give you a URL like: <https://yourusername.github.io>

### Step 2: Add DNS Records in Google Domains

Go to domains.google.com → therapylog.app → DNS → Manage custom records

Add these A records (GitHub Pages IPs):
Type: A  |  Host: @  |  Value: 185.199.108.153
Type: A  |  Host: @  |  Value: 185.199.109.153
Type: A  |  Host: @  |  Value: 185.199.110.153
Type: A  |  Host: @  |  Value: 185.199.111.153

Add this CNAME record:
Type: CNAME  |  Host: www  |  Value: yourusername.github.io

### Step 3: Add Custom Domain in GitHub Pages

1. Go back to Settings → Pages
1. Under “Custom domain” type: therapylog.app
1. Save
1. Check “Enforce HTTPS” (this enables the free SSL certificate)

### Step 4: Wait for DNS propagation

DNS changes take 10 minutes to 48 hours to fully propagate.
You can check status at: dnschecker.org

### Step 5: Set up Email Forwarding with ImprovMX (free)

1. Go to improvmx.com
1. Enter: therapylog.app
1. Set forward: [feedback@therapylog.app](mailto:feedback@therapylog.app) → [your@gmail.com](mailto:your@gmail.com)
1. They will give you MX records to add in Google Domains DNS

Add ImprovMX MX records in Google Domains:
Type: MX  |  Host: @  |  Priority: 10  |  Value: mx1.improvmx.com
Type: MX  |  Host: @  |  Priority: 20  |  Value: mx2.improvmx.com

Add SPF record:
Type: TXT  |  Host: @  |  Value: v=spf1 include:spf.improvmx.com ~all

### Verification

After setup your website will be live at:

- <https://therapylog.app> (landing page)
- <https://therapylog.app/privacy> (privacy policy — Apple needs this URL)
- <https://therapylog.app/support> (support page)

Emails to [feedback@therapylog.app](mailto:feedback@therapylog.app) will forward to your Gmail.