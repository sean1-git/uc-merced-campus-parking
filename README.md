# UC Merced Campus Parking

A small parking PWA for UC Merced. With the number of complaints received about parking spaces, we decided to create an app that allows students to check available and occupied spots.

The goal is to help students check parking before driving around campus looking for a space. The dashboard reads a supplied JSON file; the map is displayed separately through an iframe.

**Current status:** The dashboard and JSON reader are built. The real parking data file and campus map link are still needed. No live campus availability is connected yet.

## How it works

1. Check the dashboard for available and occupied space counts.
2. Select a lot to see its counts and total spaces. The app remembers your choice in this browser and restores it when parking data loads on your next visit. If that lot is missing, it shows the first lot in the list without erasing your preference. Clearing browser storage resets the saved choice; if storage is blocked, selection still works for the current visit.
3. View the campus map once the iframe link is connected. Green represents available spaces; red represents occupied spaces.

While the app is open, the system checks the parking data file every minute and updates the availability counts when the JSON data changes. It also checks when the page opens, the connection returns, or the Refresh counts button is pressed. Unchanged counts keep the existing dashboard and lot selection. The connection label distinguishes three situations:

- **Waiting for first data:** No valid file has loaded; counts stay as dashes.
- **Refresh failed:** A later request failed or the device is offline; the last valid counts stay visible with a warning.
- **Outdated counts:** The file loaded successfully, but its observation timestamp is more than 60 seconds old.

Fresh valid data restores **Data up to date**. “Data reported” shows the observation timestamp from the JSON. “Last checked” shows when this app last finished checking the file, including unchanged data and failed attempts. A recent check does not mean the parking data is fresh; the connection label shows whether the check succeeded or the counts are outdated. Check times reset when the page is reopened.

## Built with

- **Python:** serves the page and reads the parking JSON file. No runtime packages are required.
- **HTML, CSS, and JavaScript:** a simple responsive dashboard without React or a build step.
- **PWA:** supports installation and caches the page shell. Fresh counts and the external map require a connection; counts are not saved between visits.

## Run locally

Use Python 3.10 or newer:

```sh
python app.py
```

Open [localhost:8000](http://127.0.0.1:8000/). On this Windows computer, `./run.ps1` also starts the app. Installation requires HTTPS or localhost. The Python server is for local development.

