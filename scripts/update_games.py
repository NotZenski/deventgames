#!/usr/bin/env python3
"""Refresh games.js (games and team) plus their images from Roblox.

Usage: python3 scripts/update_games.py
To add or remove a game, edit PLACE_IDS below (the number in the game's Roblox URL).
To change the team, edit TEAM below (the number in the person's Roblox profile URL).
"""
import json
import pathlib
import subprocess

PLACE_IDS = [
    90135108746968,
    125743413265622,
    100011138344202,
    71098316308533,
    92184831525884,
    89025817054592,
    76128254547104,
    91023000544333,
    81397329495359,
    116564894722401,
    130204173735797,
    103854049901851,
    74608327682047,
    94966213601846,
    72312037339529,
    73513083912887,
    136153892412083,
    131959679324388,
    15367424318,
    84468626580296,
    16812323880,
    114802308612879,
]

TEAM = [
    (4004177437, "Founder"),
    (49021141, "Developer"),
    (486077110, "Developer"),
    (1004475277, "Developer"),
]

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICON_DIR = ROOT / "assets" / "games"
THUMB_DIR = ICON_DIR / "small"
WIDE_DIR = ICON_DIR / "wide"
TEAM_DIR = ROOT / "assets" / "team"
THUMB_PX = 200
WIDE_PX = 640
AVATAR_PX = 240


def fetch(url):
    return subprocess.run(
        ["curl", "-sSfL", "--max-time", "20", url], check=True, capture_output=True
    ).stdout


def get_json(url):
    return json.loads(fetch(url))


def make_jpeg(src, dest, max_px):
    """Resized JPEG copy of an image (uses macOS `sips`)."""
    subprocess.run(
        ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "75", "-Z", str(max_px),
         str(src), "--out", str(dest)],
        check=True, capture_output=True,
    )


def save_jpeg(url, dest, max_px):
    tmp = dest.with_suffix(".download.png")
    tmp.write_bytes(fetch(url))
    make_jpeg(tmp, dest, max_px)
    tmp.unlink()


def fetch_team():
    ids = ",".join(str(uid) for uid, _ in TEAM)
    heads = {
        d["targetId"]: d["imageUrl"]
        for d in get_json(
            f"https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds={ids}&size=420x420&format=Png"
        )["data"]
        if d["state"] == "Completed"
    }
    TEAM_DIR.mkdir(parents=True, exist_ok=True)
    team = []
    for uid, role in TEAM:
        user = get_json(f"https://users.roblox.com/v1/users/{uid}")
        avatar = ""
        if uid in heads:
            save_jpeg(heads[uid], TEAM_DIR / f"{uid}.jpg", AVATAR_PX)
            avatar = f"/assets/team/{uid}.jpg"
        team.append({
            "name": user["displayName"],
            "username": user["name"],
            "role": role,
            "avatar": avatar,
            "verified": user.get("hasVerifiedBadge", False),
            "link": f"https://www.roblox.com/users/{uid}/profile",
        })
        print(f"  team: {user['displayName']} (@{user['name']}) - {role}")
    return team


def main():
    universe_ids = [
        get_json(f"https://apis.roblox.com/universes/v1/places/{pid}/universe")["universeId"]
        for pid in PLACE_IDS
    ]
    ids = ",".join(map(str, universe_ids))
    details = {g["id"]: g for g in get_json(f"https://games.roblox.com/v1/games?universeIds={ids}")["data"]}
    icons = {
        d["targetId"]: d["imageUrl"]
        for d in get_json(
            f"https://thumbnails.roblox.com/v1/games/icons?universeIds={ids}&size=512x512&format=Png"
        )["data"]
        if d["state"] == "Completed"
    }
    wides = {}
    for d in get_json(
        "https://thumbnails.roblox.com/v1/games/multiget/thumbnails"
        f"?universeIds={ids}&countPerUniverse=1&size=768x432&format=Png&isCircular=false"
    )["data"]:
        shots = [t for t in d.get("thumbnails", []) if t["state"] == "Completed"]
        if shots:
            wides[d["universeId"]] = shots[0]["imageUrl"]

    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    WIDE_DIR.mkdir(parents=True, exist_ok=True)
    games = []
    for pid, uid in zip(PLACE_IDS, universe_ids):
        g = details.get(uid)
        if not g or not g.get("id"):
            print(f"  skipped place {pid}: private or unavailable on Roblox")
            continue
        image = thumb = wide = ""
        if uid in icons:
            icon_path = ICON_DIR / f"{pid}.png"
            icon_path.write_bytes(fetch(icons[uid]))
            make_jpeg(icon_path, THUMB_DIR / f"{pid}.jpg", THUMB_PX)
            image = f"/assets/games/{pid}.png"
            thumb = f"/assets/games/small/{pid}.jpg"
        if uid in wides:
            save_jpeg(wides[uid], WIDE_DIR / f"{pid}.jpg", WIDE_PX)
            wide = f"/assets/games/wide/{pid}.jpg"
        games.append({
            "title": g["name"],
            "image": image,
            "thumb": thumb,
            "wide": wide,
            "plays": g["visits"],
            "playing": g["playing"],
            "favorites": g.get("favoritedCount", 0),
            "created": g.get("created", ""),
            "creator": g["creator"]["name"],
            "creatorLink": (
                f"https://www.roblox.com/communities/{g['creator']['id']}/"
                if g["creator"]["type"] == "Group"
                else f"https://www.roblox.com/users/{g['creator']['id']}/profile"
            ),
            "universeId": uid,
            "link": f"https://www.roblox.com/games/{pid}/",
        })
        print(f"{g['visits']:>12,}  {g['name']}")

    team = fetch_team()

    games.sort(key=lambda x: x["plays"], reverse=True)
    games_json = json.dumps(games, indent=2, ensure_ascii=False)
    team_json = json.dumps(team, indent=2, ensure_ascii=False)
    (ROOT / "games.js").write_text(
        "// Generated by scripts/update_games.py. Edit PLACE_IDS / TEAM there and re-run instead of editing this file.\n"
        f"const GAMES = {games_json};\n\nconst TEAM = {team_json};\n",
        encoding="utf-8",
    )
    print(f"\nWrote {len(games)} games and {len(team)} team members to games.js")


if __name__ == "__main__":
    main()
