# 🧪 Testing Country-Based Personalization

## Quick Test Guide

### Test 1: Check Country Detection

Open browser console and run:

```javascript
// Test geolocation detection
fetch('https://ipapi.co/json/')
  .then(res => res.json())
  .then(data => {
    console.log('🌍 Your detected country:', data.country_name);
    console.log('📍 Country code:', data.country);
    console.log('🏙️ City:', data.city);
    console.log('📊 Full data:', data);
  });
```

**Expected Output:**
```
🌍 Your detected country: United States of America
📍 Country code: US
🏙️ City: New York
```

---

### Test 2: Verify Personalize Setup

1. **Open Contentstack Personalize Dashboard**
2. **Navigate to:** Experiences > "Country wise Personalize"
3. **Check Status:** Must be "Active" (not Draft)
4. **Verify Audiences:**
   - Country US: `country equals United States of America`
   - Country India: `country equals India`
5. **Verify Variants:**
   - Short UID `0`: USD Entries (enabled)
   - Short UID `1`: India Entries (enabled)

---

### Test 3: Run Your App

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:3000

3. **Open Console** (F12)

4. **Watch for logs:**
   ```
   ✅ SDK initialized
   🌍 Auto-detecting country from IP...
   📡 Trying geolocation service: ipapi.co
   ✅ Country detected via ipapi.co: United States of America
   🎯 Matched SHORT UIDs from SDK: ['0']
   ```

5. **Look for banner on page:**
   - "🌍 Showing prices for United States of America"
   - Currency shows: USD with "Auto" badge

---

### Test 4: Test Dropdown (Display-Only)

1. **Click currency selector**

2. **Select "INR"**

3. **Check Console:**
   ```
   ⚠️ ===== DROPDOWN PERSONALIZATION DISABLED =====
   📢 Dropdown changed to: INR
   📢 This is DISPLAY-ONLY - NOT changing Personalize attributes
   ```

4. **Verify:**
   - Currency shows: INR
   - Banner still shows: United States of America
   - Personalization stays: SHORT UID '0'

---

### Test 5: Test with VPN (India)

1. **Connect VPN to India**

2. **Clear browser cache:**
   - Open DevTools > Application > Local Storage
   - Clear all items
   - Close and reopen browser

3. **Reload page**

4. **Expected:**
   ```
   ✅ Country detected via ipapi.co: India
   🎯 Matched SHORT UIDs from SDK: ['1']
   ```

5. **Verify:**
   - Banner: "Showing prices for India"
   - Currency: INR with "Auto" badge
   - SHORT UID: ['1']

---

### Test 6: Check Analytics (After 15 Minutes)

1. **Wait 15 minutes** after page load

2. **Go to Contentstack Personalize:**
   - Dashboard > Analytics
   - Select Experience: "Country wise Personalize"

3. **Check Impressions:**
   ```
   Variation Name    Short UID    Impressions
   USD Entries       0            > 0
   India Entries     1            0 (if no India traffic)
   ```

---

## 🐛 Common Issues

### Issue: No country detected

**Console shows:**
```
❌ All geolocation services failed
⚠️ Could not detect country, using default
```

**Solution:**
- Check internet connection
- Try different geolocation service
- Fallback to US will work automatically

---

### Issue: No SHORT UIDs matched

**Console shows:**
```
🎯 Matched SHORT UIDs from SDK: []
⚠️ No variants matched!
```

**Solution:**
1. Check experience is **Active** (not Draft)
2. Verify country name **exactly matches**:
   - API: "United States of America"
   - Contentstack: "United States of America"
   - (case-sensitive!)
3. Check variants are **enabled**

---

### Issue: Wrong currency shown

**Expected:** USD  
**Actual:** EUR

**Solution:**
- Clear browser cache
- Check localStorage for saved values
- Reload page

---

## ✅ Success Checklist

- [ ] Console shows country detection
- [ ] Console shows SHORT UIDs matched
- [ ] Banner displays detected country
- [ ] Currency shows "Auto" badge
- [ ] Dropdown shows "Display Only Mode" warning
- [ ] Dropdown changes don't affect personalization
- [ ] Impressions tracked in console
- [ ] Analytics show impressions after 15 min

---

## 🎯 Expected Console Output (Full Flow)

```
🚀 ===== INITIALIZING CURRENCY CONTEXT =====
✅ SDK initialized
🌍 Auto-detecting country from IP...
🚀 Starting auto-detection...
🌍 Detecting country from IP address...
📡 Trying geolocation service: ipapi.co
✅ Country detected via ipapi.co: United States of America

🌍 ===== SETTING PERSONALIZE BY COUNTRY =====
📍 Detected Country: United States of America
💰 Suggested Currency: USD
💰 Final Currency: USD (auto-detected)
📝 Setting Personalize attribute: country = United States of America
✅ Attribute set successfully
🎯 Matched SHORT UIDs from SDK: ['0']
✅ Audience matched successfully
🌍 ===== PERSONALIZE SET COMPLETE =====

📊 Auto-detection result: {
  shortUids: ['0'],
  detectedCountry: 'United States of America',
  suggestedCurrency: 'USD',
  finalCurrency: 'USD'
}
✅ Auto-detection complete
   Country: United States of America
   Currency: USD
   SHORT UIDs: ['0']
🚀 ===== INITIALIZATION COMPLETE =====

🔍 CurrencyContext State: {
  currency: 'USD',
  detectedCountry: 'United States of America',
  isAutoDetected: true,
  variantAliases: ['0'],
  isLoading: false,
  isDetecting: false
}

📡 Fetching shoes with variantAliases: 0
✅ Fetched shoes

📊 ===== TRACKING IMPRESSIONS =====
📄 Page type: all
👟 Products shown: 4
🌍 Detected country: United States of America
💰 Currency: USD
🎯 SHORT UIDs to track: ['0']
🤖 Auto-detected: Yes
🔥 Triggering impressions for SHORT UIDs: ['0']
   🔥 Triggering impression for SHORT UID: "0"
   ✅ Impression tracked for SHORT UID: 0
✅ All impressions triggered successfully
📊 Event tracked: variant_impressions_tracked
✅ Impressions tracked successfully
📊 ===== TRACKING COMPLETE =====
```

---

## 🚀 Quick Debug Commands

Run in browser console:

```javascript
// Check current state
console.log('Currency:', localStorage.getItem('displayCurrency'));
console.log('Detected Country:', localStorage.getItem('detectedCountry'));
console.log('Suggested Currency:', localStorage.getItem('suggestedCurrency'));

// Clear all saved state
localStorage.clear();
location.reload();
```

---

**Happy Testing! 🎉**
