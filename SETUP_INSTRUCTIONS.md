# Personalize SDK Currency Selector - Setup Instructions

## ✅ Implementation Complete!

I've implemented a **fully automated currency selector** using the Contentstack Personalize SDK.

## 📦 What Was Installed

The implementation uses:
- `@contentstack/personalize-edge-sdk` - For variant management
- React Context for global currency state
- Client-side components for dynamic updates

## 🔧 Required Environment Variables

Add these to your `.env.local` file:

```bash
# Contentstack Basics (you should already have these)
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_ENVIRONMENT=production

# Personalize SDK (REQUIRED - you need to get these)
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_personalize_project_uid
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL=https://personalize-edge.contentstack.com
```

**Note:** The `NEXT_PUBLIC_` prefix is required for client-side access.

## 📍 How to Get Personalize Project UID

### Step 1: Check if Personalize is Enabled

1. Login to your Contentstack account
2. Go to your Stack
3. Look in the left sidebar for **"Personalize"**

### If You See "Personalize":

4. Click **"Personalize"** → **"Settings"**
5. Go to **"Project Settings"**
6. Copy the **"Project UID"**
7. Paste it in `.env.local` as `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID`

### If You DON'T See "Personalize":

You need to enable it first:

1. Go to **"Settings"** (gear icon)
2. Click **"Stack Settings"**
3. Go to **"Modules"** tab
4. Find **"Personalize"** and enable it
5. Contact Contentstack support if you don't see this option (it may require a specific plan)

### Alternative: Contact Contentstack Support

If you can't find the Personalize module:
- Email: support@contentstack.com
- Tell them: "I need to enable Personalize for my stack to use variants"
- They'll help you get the Project UID

## 🚀 How to Test

### 1. Set Up Environment Variables

Create `.env.local` with all variables above.

### 2. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 3. Open Your App

```bash
http://localhost:3000/shoes
```

### 4. Test Currency Selector

1. Look for the currency dropdown in the navbar (top-right, before search)
2. Click it - you'll see USD, EUR, INR options
3. Select EUR - prices should change to € format
4. Select INR - prices should change to ₹ format
5. Selection persists across page reloads!

## 🎯 How It Works

### Architecture:

```
User selects EUR
    ↓
CurrencyContext updates (localStorage)
    ↓
ShoesGrid detects currency change
    ↓
Fetches from /api/shoes?variant=csc4ee31b822d1b0d0
    ↓
Contentstack returns EUR variant entries
    ↓
Prices update to € format
```

### Files Created:

1. **`lib/personalize.ts`** - Personalize SDK initialization & utilities
2. **`contexts/CurrencyContext.tsx`** - Global currency state
3. **`components/CurrencySelector.tsx`** - Dropdown UI
4. **`components/ShoesGrid.tsx`** - Dynamic grid with currency support
5. **`components/ShoePrice.tsx`** - Smart price component
6. **`app/api/shoes/route.ts`** - API for fetching variants

### Files Modified:

- `lib/contentstack.ts` - Added variant support
- `app/layout.tsx` - Added CurrencyProvider
- `components/Navbar.tsx` - Added CurrencySelector
- `app/shoes/page.tsx` - Uses ShoesGrid
- `app/shoes/[url]/page.tsx` - Uses ShoePrice

## ⚠️ Troubleshooting

### Issue: "Personalize Project UID not configured" Warning

**Solution:** Add the Project UID to `.env.local`

### Issue: Prices Not Changing

**Check:**
1. `.env.local` has `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID`
2. Restart dev server after adding env variables
3. Check browser console for errors
4. Verify variants are published in Contentstack

### Issue: Can't Find Personalize in Contentstack

**Solutions:**
1. Check if your plan includes Personalize
2. Contact Contentstack support to enable it
3. Or use the "Simple Variant Guide" approach (query parameters only)

### Issue: API Route Not Working

**Check:**
1. `/api/shoes/route.ts` file exists
2. Check terminal for API errors
3. Open Network tab in browser DevTools
4. Look for requests to `/api/shoes?variant=...`

## 🔍 Expected Behavior

### On Page Load:
- Currency selector shows "$ USD"
- Prices show in USD format

### When Selecting EUR:
- Dropdown closes
- Loading spinner appears briefly
- Prices update to € format
- Currency selector shows "€ EUR"

### When Navigating:
- Selected currency persists
- All pages show prices in selected currency

## 📊 Variant UIDs (From Your JSON)

```
USD (Base): cs91db6b7e0d7f71e1
EUR:        csc4ee31b822d1b0d0
INR:        csb474334af86d3526
```

These are already configured in the code!

## ✨ Features

✅ **Three currencies:** USD, EUR, INR
✅ **Persistent selection:** Saved in localStorage
✅ **Automated fetching:** Uses Personalize SDK
✅ **Loading states:** Smooth animations
✅ **Real-time updates:** No page refresh needed
✅ **Type-safe:** Full TypeScript support

## 🎬 Next Steps

1. **Get Personalize Project UID** from Contentstack
2. **Add it to `.env.local`**
3. **Restart dev server**
4. **Test the currency selector!**

## 💡 If You Can't Get Personalize Project UID

You can still use variants with the simpler approach:
- See `SIMPLE_VARIANT_GUIDE.md` for instructions
- Uses query parameters instead of SDK
- No Personalize Project UID required
- Still fully functional!

---

**Need Help?**

If you need assistance:
1. Check browser console for error messages
2. Check terminal for API errors
3. Review the troubleshooting section above
4. Contact Contentstack support for Personalize setup

**Ready to test!** Add the Project UID to `.env.local` and restart your dev server! 🚀
