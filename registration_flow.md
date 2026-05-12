# WhatsApp Worker Registration Flow

This document outlines the automated WhatsApp registration flow designed for onboarding service workers (Electricians, Plumbers, and House Workers).

## Overview
The system tracks the user's registration state across multiple steps. Each step must be completed before the bot moves to the next one. The bot supports dual languages (English and Hindi), which the user selects at the very beginning of the interaction.

There are two primary ways a worker can be registered:
1. **Self-Registration:** A worker joins the target group (or interacts with the bot) and their phone number is captured automatically.
2. **Admin-Registration:** An internal member (Group Admin) types `/register` in the chat to register a worker on their behalf. The admin is prompted to manually enter the worker's phone number.

---

## 1. Trigger & Language Selection
**When it happens:** 
- **Self-Registration:** Triggered automatically when a new member joins the target WhatsApp group, or if a user sends `1` or `2` initially.
- **Admin-Registration:** Triggered when an internal group admin sends `/register`.

**Action:** The bot greets the user and asks them to select their preferred language.

**Question Text:**
> Welcome! Please select your preferred language / स्वागत है! कृपया अपनी पसंदीदा भाषा चुनें:
> 
> 1️⃣ English के लिए "1" टाइप करें
> 2️⃣ Hindi के लिए "2" टाइप करें
> 
> Reply with: 1 or 2

*Once the user replies with `1` or `2`, the language preference is saved.*

---

## 2. Phone Number (Admin Flow Only)
**State Tracker Step:** `phone`
**Action:** If an Admin initiated the registration, the bot asks for the worker's phone number. If it is a Self-Registration, this step is **skipped** and the phone number is captured automatically from their WhatsApp ID.

**Question Text (English):**
> Please enter the phone number of the worker you want to register (with country code):

**Question Text (Hindi):**
> कृपया उस कार्यकर्ता का फोन नंबर दर्ज करें जिसे आप पंजीकृत करना चाहते हैं (देश कोड के साथ):

---

## 3. Full Name
**State Tracker Step:** `name`
**Action:** The bot asks for the worker's full name.

**Question Text (English):**
> Please enter your full name:

**Question Text (Hindi):**
> कृपया अपना पूरा नाम दर्ज करें:

---

## 4. Primary Profession Selection
**State Tracker Step:** `profession`
**Action:** The bot asks the user to categorize the primary service they offer.

**Question Text (English):**
> Please select your profession:
> 1️⃣ Electrician
> 2️⃣ Plumber
> 3️⃣ House Work
> 
> Reply with: 1, 2, or 3

*(If the user types anything other than 1, 2, or 3, they receive an "Invalid Option" error and must try again).*

---

## 5. Dynamic Sub-Profession (Specialization)
**State Tracker Step:** `subProfession`
**Action:** Based on the selection in Step 4, the bot dynamically asks for their specific skill set or specialization.

#### If Profession = Electrician (1):
> Please select your Electrician specialization:
> 1️⃣ Wiring
> 2️⃣ Appliance Repair
> 3️⃣ Installation
> 
> Reply with: 1, 2, or 3

#### If Profession = Plumber (2):
> Please select your Plumber specialization:
> 1️⃣ Pipe Leakage
> 2️⃣ Bathroom Fittings
> 3️⃣ Water Tank
> 
> Reply with: 1, 2, or 3

#### If Profession = House Work (3):
> Please select your House Work specialization:
> 1️⃣ Cleaning
> 2️⃣ Cooking
> 3️⃣ Babysitting
> 
> Reply with: 1, 2, or 3

*(Validation is enforced here as well: inputs must be 1, 2, or 3).*

---

## 6. Completion & Success
**Action:** Once a valid specialization is selected, the bot maps the number to the readable string (e.g., `1` -> `Wiring`), securely stores all the collected data, clears the user's registration state, and sends a final confirmation message.

**Final Message (English):**
> Registration complete! ✓
> 
> Name: [User's Name]
> Phone: [User's Phone]
> Profession: [Electrician / Plumber / House Work]
> Specialization: [Selected Specialization]

---

## Under the Hood
* **`registration-tracker.ts`**: Manages the state machine. Tracks which user phone number is currently on which step (`phone` -> `name` -> `profession` -> `subProfession`).
* **`language.ts`**: Contains all localization strings and mappings for English and Hindi.
* **`event-handlers.ts`**: Contains the core message parsing logic, logic to pre-fill phone numbers for self-registered users, admin `/register` command handlers, and progression routing.
