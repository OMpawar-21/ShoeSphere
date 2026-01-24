# 🌍 IP-Based Geolocation Personalization - Complete Implementation Guide

## Your Setup Summary

Based on your requirements:

✅ **Contentstack Personalize Configuration:**
- Experience Name: "Country wise Personalize"
- Segmented Experience with 2 variants

**Audiences:**
1. Country US
   - Condition: `country equals United States of America`
   
2. Country India
   - Condition: `country equals India`

**Variants:**
- Short UID `0`: USD Entries
- Short UID `1`: India Entries (INR)

**Features:**
- ✅ Auto-detect country from IP address
- ✅ Automatic currency based on location
- ✅ Manual currency override dropdown
- ✅ No hardcoding - all dynamic via SDK
- ✅ Proper impression tracking

---

## 📋 Implementation Steps

### Step 1: Replace Core Files

#### 1.1 Replace `lib/personalize.ts`

```bash
# Backup old file
mv lib/personalize.ts lib/personalize.ts.backup

# Use new file
cp personalize-geolocation.ts lib/personalize.ts
```

**What's New:**
- ✅ `detectCountryFromIP()` - Detects user's country from IP
- ✅ `autoDetectAndSetPersonalize()` - Auto-sets country attribute
- ✅ `setPersonalizeByCountry()` - Sets Personalize with country name
- ✅ `setManualCurrency()` - Manual override support
- ✅ No hardcoded variant UIDs - uses `getVariantAliases()`

#### 1.2 Replace `contexts/CurrencyContext.tsx`

```bash
# Backup old file
mv contexts/CurrencyContext.tsx contexts/CurrencyContext.tsx.backup

# Use new file
cp CurrencyContext-geolocation.tsx contexts/CurrencyContext.tsx
```

**What's New:**
- ✅ Auto-detects country on app load
- ✅ Sets Personalize `country` attribute
- ✅ Tracks manual vs auto-detected state
- ✅ Stores user preference in localStorage
- ✅ Respects manual overrides

#### 1.3 Replace `components/CurrencySelector.tsx`

```bash
# Backup old file
mv components/CurrencySelector.tsx components/CurrencySelector.tsx.backup

# Use new file
cp CurrencySelector-geolocation.tsx components/CurrencySelector.tsx
```

**What's New:**
- ✅ Shows "Detecting location..." while loading
- ✅ Displays detected country
- ✅ Shows "Auto" badge for auto-detected currency
- ✅ Manual override capability
- ✅ Better UX with location info

#### 1.4 Update `components/ShoesGrid.tsx`

```bash
# Backup old file
mv components/ShoesGrid.tsx components/ShoesGrid.tsx.backup

# Use new file
cp ShoesGrid-geolocation.tsx components/ShoesGrid.tsx
```

**What's New:**
- ✅ Location detection loading state
- ✅ Shows detected country banner
- ✅ Tracks impressions with country context
- ✅ Better debug information

---

## 🌍 Step 2: How It Works

### Initial Page Load Flow:

```
User opens website
    ↓
1. CurrencyContext initializes
    ↓
2. Calls detectCountryFromIP()
    ↓
3. Geolocation API returns: "United States of America"
    ↓
4. Sets Personalize attribute: { country: "United States of America" }
    ↓
5. SDK matches audience: "Country US"
    ↓
6. Returns SHORT UID: ['0']
    ↓
7. Stores: 
   - currency: 'USD'
   - detectedCountry: 'United States of America'
   - shortUids: ['0']
   - isAutoDetected: true
    ↓
8. Components display USD prices
    ↓
9. Trigger impression for SHORT UID '0'
    ↓
10. Contentstack Analytics: USD Entries impression +1
```

### Manual Override Flow:

```
User clicks currency selector
    ↓
User selects INR
    ↓
1. Calls setManualCurrency('INR')
    ↓
2. Maps INR → "India"
    ↓
3. Sets Personalize: { country: "India" }
    ↓
4. SDK matches audience: "Country India"
    ↓
5. Returns SHORT UID: ['1']
    ↓
6. Updates state:
   - currency: 'INR'
   - shortUids: ['1']
   - isAutoDetected: false
    ↓
7. Saves to localStorage: manualCurrency='INR'
    ↓
8. Components re-fetch with INR
    ↓
9. Trigger impression for SHORT UID '1'
    ↓
10. Contentstack Analytics: India Entries impression +1
```

---

## 🧪 Step 3: Testing

### Test 1: Auto-Detection

1. Clear browser data (localStorage)
2. Reload page
3. **Expected in console:**
   ```
   🌍 Detecting country from IP address...
   📡 Trying geolocation service: ipapi.co
   ✅ Country detected via ipapi.co: United States of America
   📝 Setting Personalize attribute: country = United States of America
   ✅ Attribute set successfully
   🎯 Matched SHORT UIDs from SDK: ['0']
   ✅ Audience matched successfully
   ```

4. **Expected in UI:**
   - Banner: "Showing prices for United States of America"
   - Currency: USD with "Auto" badge
   - Prices in dollars ($)

5. **Wait 15 minutes, check Contentstack Analytics:**
   - SHORT UID `0` should have impressions > 0

### Test 2: Manual Override

1. Click currency selector
2. Select "INR"
3. **Expected in console:**
   ```
   💱 Manual currency override: INR
   📝 Setting Personalize attribute: country = India
   🎯 Matched SHORT UIDs from SDK: ['1']
   ```

4. **Expected in UI:**
   - Banner: "Currency manually set to INR"
   - Currency: INR (no "Auto" badge)
   - Prices in rupees (₹)

5. **Wait 15 minutes, check Contentstack Analytics:**
   - SHORT UID `1` should have impressions > 0

### Test 3: Persistence

1. Set currency to INR manually
2. Refresh page
3. **Expected:**
   - Should still show INR
   - Should show "Currency manually set"
   - No auto-detection should run

### Test 4: VPN/Different Location

1. Use VPN to connect from India
2. Clear browser data
3. Reload page
4. **Expected:**
   - Should detect "India"
   - Should auto-set to INR
   - Should use SHORT UID '1'

---

## 🔍 Step 4: Verification Checklist

**Contentstack Setup:**
- [ ] Experience "Country wise Personalize" exists
- [ ] Experience is **Active** (not Draft)
- [ ] Audience "Country US" exists
  - Condition: `country equals United States of America`
- [ ] Audience "Country India" exists
  - Condition: `country equals India`
- [ ] Variant with Short UID `0` exists (USD Entries)
- [ ] Variant with Short UID `1` exists (India Entries)
- [ ] Both variants are **enabled** (toggle ON)

**Code Implementation:**
- [ ] `lib/personalize.ts` replaced with geolocation version
- [ ] `contexts/CurrencyContext.tsx` replaced
- [ ] `components/CurrencySelector.tsx` replaced
- [ ] `components/ShoesGrid.tsx` updated
- [ ] `components/ShoeDetail.tsx` updated (similar to ShoesGrid)
- [ ] `components/HomeShoeGrid.tsx` updated (similar to ShoesGrid)

**Testing:**
- [ ] Auto-detection works (US location → USD)
- [ ] Manual override works (select INR → shows INR)
- [ ] Persistence works (refresh → keeps selection)
- [ ] Console shows correct SHORT UIDs
- [ ] Impressions tracked (console confirms)
- [ ] Analytics update after 15 min

---

## 🎯 Expected Console Output

### On Page Load (US User):

```
🚀 ===== INITIALIZING CURRENCY CONTEXT =====
✅ SDK initialized
🌍 Auto-detecting country from IP...
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

🔄 Fetching shoes for currency: USD
✅ Fetched 20 shoes

📊 ===== TRACKING IMPRESSIONS =====
📄 Page type: all
👟 Products shown: 20
🌍 Detected country: United States of America
💰 Currency: USD
🎯 SHORT UIDs to track: ['0']
🤖 Auto-detected: Yes
🔥 Triggering impressions for SHORT UIDs: ['0']
   🔥 Triggering impression for SHORT UID: "0"
   ✅ Impression tracked for SHORT UID: 0
✅ All impressions triggered successfully
📊 Event tracked: variant_impressions_tracked
📋 Tracking all list view (20 products)
📊 Product list view event tracked
✅ Impressions tracked successfully
📊 ===== TRACKING COMPLETE =====
```

### On Manual Override (Select INR):

```
💱 ===== CHANGING CURRENCY =====
New Currency: INR
Is Manual Override: true
👤 Manual currency selection
💱 Manual currency override: INR

🌍 ===== SETTING PERSONALIZE BY COUNTRY =====
📍 Detected Country: India
💰 Suggested Currency: INR
💰 Final Currency: INR (auto-detected)
📝 Setting Personalize attribute: country = India
✅ Attribute set successfully
🎯 Matched SHORT UIDs from SDK: ['1']
✅ Audience matched successfully
🌍 ===== PERSONALIZE SET COMPLETE =====

🎯 Matched SHORT UIDs: ['1']
📊 Event tracked: manual_currency_override
💱 ===== CURRENCY CHANGE COMPLETE =====

[... fetching and impression tracking with SHORT UID '1' ...]
```

---

## 🚨 Troubleshooting

### Issue 1: No SHORT UIDs returned

**Symptom:**
```
🎯 Matched SHORT UIDs from SDK: []
⚠️ No variants matched!
```

**Solutions:**
1. Check experience is **Active** in Contentstack
2. Verify exact country name matches:
   - API returns: "United States of America"
   - Contentstack condition: `country equals United States of America`
   - They must match EXACTLY (case-sensitive!)
3. Check both variants are enabled
4. Use Preview in Contentstack to test

### Issue 2: Geolocation fails

**Symptom:**
```
❌ All geolocation services failed
⚠️ Could not detect country, using default
```

**Solutions:**
1. Check internet connection
2. Try different geolocation service
3. Check browser console for CORS errors
4. Fallback to default (USD) will work

### Issue 3: Wrong country detected

**Symptom:**
User in India but detects as US (or vice versa)

**Causes:**
- VPN usage
- Corporate proxy
- Geolocation API inaccuracy

**Solution:**
User can manually override via currency selector

### Issue 4: Manual override not persisting

**Symptom:**
Refresh page returns to auto-detected currency

**Check:**
1. localStorage is enabled
2. No errors in console
3. `isManualCurrency` flag is set

### Issue 5: Country name mismatch

**Problem:**
API returns "USA" but Contentstack expects "United States of America"

**Solution:**
Update audience condition to accept multiple values:
```
country equals United States of America
OR
country equals USA
OR
country equals US
```

---

## 💡 Pro Tips

### Tip 1: Country Name Normalization

Different geolocation APIs return different formats:
- "United States"
- "United States of America"
- "USA"
- "US"

**Solution:** Use multiple conditions in Contentstack audience:
```
country is_one_of [United States of America, USA, US, United States]
```

### Tip 2: Testing Different Locations

To test without VPN:
1. Use browser's location spoofing (DevTools)
2. Or manually call:
   ```javascript
   setPersonalizeByCountry('India')
   ```

### Tip 3: Caching Geolocation Result

Current implementation caches in localStorage.
Consider adding:
- Cache expiry (24 hours)
- Re-detection on cache miss

### Tip 4: Analytics Delay

Remember:
- Impressions appear in Contentstack after 10-15 minutes
- Don't panic if they're not immediate
- Check console logs to confirm tracking was called

### Tip 5: HTTPS Required

Some geolocation APIs require HTTPS.
Ensure your site is served over HTTPS in production.

---

## 📊 Expected Results

### In Browser:

**US User:**
- Detects: United States of America
- Shows: USD prices
- Banner: "Showing prices for United States of America"

**Indian User:**
- Detects: India
- Shows: INR prices
- Banner: "Showing prices for India"

**User with Manual Override:**
- Shows override banner
- Respects manual selection
- Persists across refreshes

### In Contentstack Analytics:

After 15 minutes of testing:

```
Experience: Country wise Personalize

Variation Name    Short UID    Impressions
USD Entries       0            50
India Entries     1            25
```

---

## ✅ Success Criteria

You'll know it's working when:

1. **Console shows:**
   - ✅ Country detected
   - ✅ SHORT UIDs matched
   - ✅ Impressions tracked

2. **UI shows:**
   - ✅ Correct currency based on location
   - ✅ Location banner displays
   - ✅ Manual override works

3. **Contentstack shows:**
   - ✅ Impressions > 0 for both variants
   - ✅ Analytics updating

4. **User experience:**
   - ✅ Automatic currency on first visit
   - ✅ Can manually change if needed
   - ✅ Selection persists

---

## 🚀 Next Steps

After implementation:

1. **Test thoroughly** with both US and India locations
2. **Monitor analytics** for first 24 hours
3. **Gather user feedback** on accuracy
4. **Consider adding more countries** if successful
5. **Add more currencies** (EUR, GBP, etc.)

---

## 📝 Summary

**What Changes:**
- `lib/personalize.ts` → Adds IP geolocation
- `contexts/CurrencyContext.tsx` → Auto-detects on load
- `components/CurrencySelector.tsx` → Shows detection status
- `components/ShoesGrid.tsx` → Displays location info

**What Stays:**
- Contentstack Personalize configuration
- SHORT UID tracking approach
- No hardcoded values
- SDK-based matching

**New Features:**
- ✅ Automatic country detection from IP
- ✅ Auto currency based on location
- ✅ Manual override capability
- ✅ Persistence of user preference
- ✅ Better UX with location display

You're ready to implement! 🎉
