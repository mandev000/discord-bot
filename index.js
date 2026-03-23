# Bot Discord Fake Casino - Full Animation Đẹp | Tài Xỉu + Xóc Đĩa Rigged
# Fake vui vẻ, tiền ảo, animation GIF luxury

import discord
from discord import app_commands
from discord.ext import commands
import random
import asyncio
import json
from datetime import datetime
import os

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

# File data
DATA_FILE = "casino_data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {"users": {}, "codes": {}}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

data = load_data()

# Config
DAILY_AMOUNT = 500
COOLDOWN = 86400  # 24h
RIGGED_MODE = False
RIGGED_WIN_RATE = 0.70  # 70% nhà cái thắng khi rigged

SHOP_ITEMS = {
    "vip_bronze": {"price": 2000, "desc": "VIP Bronze fake"},
    "vip_silver": {"price": 5000, "desc": "VIP Silver fake"},
    "vip_gold": {"price": 10000, "desc": "VIP Gold fake"}
}

YOUR_DISCORD_ID = 123456789012345678  # THAY BẰNG ID DISCORD CỦA MÀY

# Animation GIF đẹp (link public, chạy ổn)
ANIM_DICE_ROLL = "https://media.giphy.com/media/3o6Zt6KHxJTzXCnSvu/giphy.gif"  # xúc xắc lăn luxury
ANIM_BOWL_SHAKE = "https://media.tenor.com/5q5q5q5q5q5AAAAC/xoc-dia-shake.gif"  # rung bát xóc đĩa (thay bằng link thật nếu tìm được)
ANIM_WIN_MONEY = "https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif"   # tiền bay confetti
ANIM_LOSE_SAD = "https://media.tenor.com/images/abc123def4567890/sad-lose.gif"  # buồn thua (thay nếu muốn)

@bot.event
async def on_ready():
    print(f"Bot casino animation chạy: {bot.user}")
    try:
        await bot.tree.sync()
        print("Sync lệnh OK")
    except Exception as e:
        print(e)

@bot.tree.command(name="balance", description="Check xu fake")
async def balance(interaction: discord.Interaction):
    user_id = str(interaction.user.id)
    if user_id not in data["users"]:
        data["users"][user_id] = {"money": 1000, "last_daily": 0}
        save_data(data)
    await interaction.response.send_message(f"**{interaction.user.name}** có **{data['users'][user_id]['money']}** xu fake!")

@bot.tree.command(name="daily", description="Nhận xu free")
async def daily(interaction: discord.Interaction):
    user_id = str(interaction.user.id)
    if user_id not in data["users"]:
        data["users"][user_id] = {"money": 1000, "last_daily": 0}
    
    now = datetime.utcnow().timestamp()
    last = data["users"][user_id]["last_daily"]
    
    if now - last < COOLDOWN:
        remaining = int(COOLDOWN - (now - last))
        h, m = divmod(remaining // 60, 60)
        await interaction.response.send_message(f"Chờ **{h}h {m}p** mới daily!")
        return
    
    data["users"][user_id]["money"] += DAILY_AMOUNT
    data["users"][user_id]["last_daily"] = now
    save_data(data)
    await interaction.response.send_message(f"Daily +**{DAILY_AMOUNT}** xu! Tổng: **{data['users'][user_id]['money']}**")

@bot.tree.command(name="top", description="Top giàu fake")
async def top(interaction: discord.Interaction):
    sorted_users = sorted(data["users"].items(), key=lambda x: x[1]["money"], reverse=True)[:10]
    msg = "**Top 10 giàu nhất (fake)**\n"
    for i, (uid, info) in enumerate(sorted_users, 1):
        try:
            user = await bot.fetch_user(int(uid))
            msg += f"{i}. **{user.name}** - **{info['money']}** xu\n"
        except:
            msg += f"{i}. User {uid} - **{info['money']}** xu\n"
    await interaction.response.send_message(msg or "Chưa ai giàu")

@bot.tree.command(name="taixiu", description="Tài Xỉu fake + animation")
@app_commands.describe(choose="Tài hoặc Xỉu", bet="Số xu cược")
async def taixiu(interaction: discord.Interaction, choose: str, bet: int):
    user_id = str(interaction.user.id)
    if user_id not in data["users"] or data["users"][user_id]["money"] < bet or bet <= 0:
        await interaction.response.send_message("Hết tiền hoặc bet ngu!")
        return

    # Animation lăn xúc xắc
    embed_roll = discord.Embed(title="🎲 ĐANG LẮC TÀI XỈU...", color=0x00ffff)
    embed_roll.set_image(url=ANIM_DICE_ROLL)
    await interaction.response.send_message(embed=embed_roll)

    await asyncio.sleep(4)  # chờ animation

    dice = [random.randint(1,6) for _ in range(3)]
    total = sum(dice)
    result = "Tài" if total >= 11 else "Xỉu"

    if RIGGED_MODE:
        win = False if random.random() < RIGGED_WIN_RATE else (choose.lower() in ["tài", "tai"] and result == "Tài") or (choose.lower() in ["xỉu", "xiu"] and result == "Xỉu")
    else:
        win = (choose.lower() in ["tài", "tai"] and result == "Tài") or (choose.lower() in ["xỉu", "xiu"] and result == "Xỉu")

    if win:
        data["users"][user_id]["money"] += bet
        embed_result = discord.Embed(title="THẮNG LỚN CU!", description=f"Cược **{bet}** → **{choose.upper()}**\nKết quả: {dice} = **{total}** → **{result}**\n+**{bet}** xu\nTổng: **{data['users'][user_id]['money']}**", color=0x00ff00)
        embed_result.set_image(url=ANIM_WIN_MONEY)
    else:
        data["users"][user_id]["money"] -= bet
        embed_result = discord.Embed(title="THUA MẸ RỒI!", description=f"Cược **{bet}** → **{choose.upper()}**\nKết quả: {dice} = **{total}** → **{result}**\nCòn **{data['users'][user_id]['money']}** xu", color=0xff0000)
        embed_result.set_image(url=ANIM_LOSE_SAD)  # thay link sad nếu muốn

    save_data(data)
    await interaction.followup.send(embed=embed_result)

@bot.tree.command(name="xocdia", description="Xóc Đĩa fake + animation")
@app_commands.describe(choose="Chẵn hoặc Lẻ", bet="Số xu cược")
async def xocdia(interaction: discord.Interaction, choose: str, bet: int):
    user_id = str(interaction.user.id)
    if user_id not in data["users"] or data["users"][user_id]["money"] < bet or bet <= 0:
        await interaction.response.send_message("Hết tiền hoặc bet ngu!")
        return

    # Animation rung bát
    embed_shake = discord.Embed(title="🍲 ĐANG XÓC ĐĨA...", color=0xffd700)
    embed_shake.set_image(url=ANIM_BOWL_SHAKE)
    await interaction.response.send_message(embed=embed_shake)

    await asyncio.sleep(4)

    dice = [random.randint(1,6) for _ in range(4)]
    total = sum(dice)
    result = "Chẵn" if total % 2 == 0 else "Lẻ"

    if RIGGED_MODE:
        win = False if random.random() < RIGGED_WIN_RATE else (choose.lower() in ["chẵn", "chan"] and result == "Chẵn") or (choose.lower() in ["lẻ", "le"] and result == "Lẻ")
    else:
        win = (choose.lower() in ["chẵn", "chan"] and result == "Chẵn") or (choose.lower() in ["lẻ", "le"] and result == "Lẻ")

    if win:
        data["users"][user_id]["money"] += bet
        embed_result = discord.Embed(title="THẮNG ĐỈNH CAO!", description=f"Cược **{bet}** → **{choose.upper()}**\nKết quả: {dice} = **{total}** → **{result}**\n+**{bet}** xu\nTổng: **{data['users'][user_id]['money']}**", color=0x00ff00)
        embed_result.set_image(url=ANIM_WIN_MONEY)
    else:
        data["users"][user_id]["money"] -= bet
        embed_result = discord.Embed(title="THUA ĐẮNG!", description=f"Cược **{bet}** → **{choose.upper()}**\nKết quả: {dice} = **{total}** → **{result}**\nCòn **{data['users'][user_id]['money']}** xu", color=0xff0000)
        embed_result.set_image(url=ANIM_LOSE_SAD)

    save_data(data)
    await interaction.followup.send(embed=embed_result)

# Các lệnh còn lại giữ nguyên (shop, buy, redeem, addcode, rigged)
@bot.tree.command(name="shop", description="Shop VIP fake")
async def shop(interaction: discord.Interaction):
    msg = "**SHOP FAKE VIP**\n"
    for item, info in SHOP_ITEMS.items():
        msg += f"- **{item.upper()}**: {info['price']} xu - {info['desc']}\n"
    await interaction.response.send_message(msg + "\nDùng /buy <tên>")

@bot.tree.command(name="buy", description="Mua VIP fake")
@app_commands.describe(item="vip_bronze | vip_silver | vip_gold")
async def buy(interaction: discord.Interaction, item: str):
    user_id = str(interaction.user.id)
    if user_id not in data["users"]:
        await interaction.response.send_message("Dùng /daily trước!")
        return
    item = item.lower()
    if item not in SHOP_ITEMS:
        await interaction.response.send_message("Item ko tồn tại!")
        return
    price = SHOP_ITEMS[item]["price"]
    if data["users"][user_id]["money"] < price:
        await interaction.response.send_message(f"Cần {price} xu, mày có {data['users'][user_id]['money']}")
        return
    data["users"][user_id]["money"] -= price
    save_data(data)
    await interaction.response.send_message(f"Mua **{item.upper()}** OK! VIP fake rồi cu!")

@bot.tree.command(name="redeem", description="Nhập code xu fake")
@app_commands.describe(code="Code")
async def redeem(interaction: discord.Interaction, code: str):
    code = code.upper()
    if "codes" not in data or code not in data["codes"]:
        await interaction.response.send_message("Code sai hoặc hết hạn!")
        return
    amount = data["codes"][code]
    user_id = str(interaction.user.id)
    if user_id not in data["users"]:
        data["users"][user_id] = {"money": 1000, "last_daily": 0}
    data["users"][user_id]["money"] += amount
    del data["codes"][code]
    save_data(data)
    await interaction.response.send_message(f"Code **{code}** OK! +**{amount}** xu. Tổng **{data['users'][user_id]['money']}**")

@bot.command()
async def addcode(ctx, code: str, amount: int):
    if ctx.author.id != YOUR_DISCORD_ID:
        return
    if "codes" not in data:
        data["codes"] = {}
    data["codes"][code.upper()] = amount
    save_data(data)
    await ctx.send(f"Add code **{code}** +{amount} xu")

@bot.command()
async def rigged(ctx, mode: str):
    global RIGGED_MODE
    if ctx.author.id != YOUR_DISCORD_ID:
        await ctx.send("Ko phải chủ!")
        return
    RIGGED_MODE = mode.lower() == "on"
    status = "ON - bịp 70%" if RIGGED_MODE else "OFF - fair"
    await ctx.send(f"Rigged {status}!")

bot.run(os.getenv("BOT_TOKEN"))  # Railway đọc từ biến BOT_TOKEN
