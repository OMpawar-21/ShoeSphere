# How to See Variant Impression Counts in Contentstack Analytics

## ✅ Good News!

You **DON'T need to create events** in Contentstack! 
`triggerImpression()` automatically tracks impressions for analytics.

---

## 🎯 What You Need to Do

### Step 1: Verify SDK is Initialized ✅

**Check browser console for:**
```
✅ Personalize SDK initialized successfully
```

**If you don't see this:**
- Check `.env.local` has `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID`
- Restart dev server after adding env variable

---

### Step 2: Verify Variant Aliases are Being Returned ✅

**When you switch currency, check console for:**
```
✅ User attributes set: {currency: 'EUR'}
🎯 Matched variant aliases: ['v2']  ← This is what you need!
💰 Currency changed to EUR, variant aliases: ['v2']
```

**If variant aliases are empty `[]`:**
- You need to set up **Audiences** and **Experiences** in Contentstack UI (see Step 3)

---

### Step 3: Set Up Contentstack Personalize UI (Required!)

#### 3.1 Create Audiences

1. Go to **Contentstack → Personalize → Audiences**
2. Create three audiences:

**Audience 1: US Customers**
- Name: `US Customers`
- Condition: `currency equals USD`

**Audience 2: European Customers**
- Name: `European Customers`
- Condition: `currency equals EUR`

**Audience 3: Indian Customers**
- Name: `Indian Customers`
- Condition: `currency equals INR`

#### 3.2 Create Experience

1. Go to **Contentstack → Personalize → Experiences**
2. Click **"Create Experience"**
3. Fill in:
   - **Name**: `Currency Based Pricing`
   - **Type**: Personalization
   - **Status**: Active

#### 3.3 Add Variations to Experience

Add three variations:

**Variation 1: USD Pricing**
- Name: `USD Pricing`
- Audience: `US Customers`
- Content Type: `shoes`
- Select your USD variant entries

**Variation 2: EUR Pricing**
- Name: `EUR Pricing`
- Audience: `European Customers`
- Content Type: `shoes`
- Select your EUR variant entries

**Variation 3: INR Pricing**
- Name: `INR Pricing`
- Audience: `Indian Customers`
- Content Type: `shoes`
- Select your INR variant entries

4. **Publish** the experience

---

### Step 4: Verify Impressions are Being Tracked ✅

**Check browser console when viewing products:**

You should see:
```
📊 Impressions tracked for variants: ['v2']
   └─ Total impressions: 1
   └─ Variant count: 1
   └─ Impression 1/1: v2
```

**This confirms `triggerImpression()` is being called!**

---

### Step 5: Check Contentstack Analytics Dashboard

1. Go to **Contentstack → Personalize → Analytics**
2. Select your experience: `Currency Based Pricing`
3. Check the **"Impressions"** column

**Expected Results:**
```
Variation          Impressions    Clicks    Conversions
USD Pricing        1,234          -         -
EUR Pricing        891            -         -
INR Pricing        456            -         -
```

---

## 🐛 Troubleshooting

### Problem: No variant aliases returned

**Symptoms:**
```
🎯 Matched variant aliases: []  ← Empty array!
```

**Solutions:**
1. ✅ Check audiences are created correctly
2. ✅ Check experience is **Active**
3. ✅ Check variations are linked to correct audiences
4. ✅ Verify variant entries exist in Contentstack
5. ✅ Publish the experience

### Problem: Impressions tracked but not in analytics

**Check:**
1. ✅ Wait 10-15 minutes (analytics can be delayed)
2. ✅ Check date range filter (set to "Today" or "Last 7 days")
3. ✅ Verify experience is active
4. ✅ Check variant aliases match what's in Contentstack

### Problem: SDK not initialized

**Symptoms:**
```
❌ NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID not configured
```

**Solution:**
1. Get Project UID from **Personalize → Settings → Project Settings**
2. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid_here
   ```
3. Restart dev server

---

## 📊 What Gets Tracked Automatically

When `triggerImpression()` is called:
- ✅ **Impression count** - How many times variant was shown
- ✅ **Timestamp** - When impression occurred
- ✅ **User session** - Session information
- ✅ **Variant alias** - Which variant was shown

**This data appears automatically in Analytics dashboard!**

---

## 🧪 Testing Checklist

### Console Verification:
- [ ] SDK initialized successfully
- [ ] Variant aliases returned (not empty)
- [ ] Impressions tracked logs appear
- [ ] No errors in console

### Contentstack UI Verification:
- [ ] Audiences created (USD, EUR, INR)
- [ ] Experience created and **Active**
- [ ] Variations added to experience
- [ ] Experience published

### Analytics Verification:
- [ ] Wait 10-15 minutes after testing
- [ ] Go to Analytics dashboard
- [ ] Select your experience
- [ ] Check "Impressions" column
- [ ] Numbers should be increasing

---

## 🎯 Quick Test

1. **Start dev server**: `npm run dev`
2. **Open browser console**
3. **Navigate to homepage**
4. **Switch currency to EUR**
5. **Check console for:**
   ```
   ✅ Personalize SDK initialized successfully
   ✅ User attributes set: {currency: 'EUR'}
   🎯 Matched variant aliases: ['v2']  ← Should NOT be empty!
   📊 Impressions tracked for variants: ['v2']
   ```
6. **Wait 15 minutes**
7. **Check Contentstack Analytics**
8. **Impressions should show up!**

---

## 💡 Key Points

1. **You DON'T need events** - Impressions are tracked automatically
2. **`triggerImpression()` is what counts** - This is already in your code
3. **You DO need** - Audiences and Experiences set up in Contentstack UI
4. **Analytics delay** - Takes 10-15 minutes to appear
5. **Variant aliases** - Must match what's in Contentstack

---

## 📝 Summary

**To see impression counts:**

1. ✅ Set up Audiences in Contentstack (USD, EUR, INR)
2. ✅ Create Experience with variations
3. ✅ Verify variant aliases are returned (check console)
4. ✅ Verify impressions are tracked (check console logs)
5. ✅ Wait 15 minutes
6. ✅ Check Analytics dashboard

**That's it! No events needed - just impressions!** 🎉
