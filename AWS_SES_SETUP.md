# Amazon SES Setup (Creating Your First Identity)

If your "Identities" list is empty, you must create one.

## Q: Can I use ANY email?
**Yes**, but with one condition: **You must have access to its inbox.**
AWS will send a verification link to that email. You have to click it to prove you own it. You cannot use a fake email or someone else's email.

## Step 1: Create the Identity (The Sender)
1.  Go to **Amazon SES** -> **Identities**.
2.  Click **Create identity**.
3.  Select **Email address**.
4.  Enter your email address (e.g., your personal Gmail or your work email).
    *   *This will be your `SENDER_EMAIL`.*
5.  Click **Create identity**.

## Step 2: Verify It
1.  Go to the **Inbox** of the email you just entered.
2.  Look for an email from **Amazon Web Services**.
3.  Click the link inside that email.
4.  Go back to the AWS Console and refresh the page. The identity status should now say **Verified** (Green).

## Step 3: Important Sandbox Rule
Since you are likely in the "Sandbox":
**You can ONLY send email TO addresses that are Verified.**

**What this means for you:**
If you want to test the app by creating an alert as `user1@example.com`, you MUST also go back to Step 1 and verify `user1@example.com` as a second identity.
*   **Sender**: Must be verified.
*   **Receiver**: Must be verified (while in Sandbox).

Once you verify the emails, you can update your `.env` file with the keys and the sender email.
