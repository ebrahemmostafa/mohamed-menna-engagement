const supabaseUrl = "https://jcuqwcwkowtjxcykstlf.supabase.co";
const supabasePublishableKey = "sb_publishable_BFtrH3u_sv9zat6B9SALyw_nS7Pajaa";
const wishesTable = "mohammed_menna_wishes";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabasePublishableKey);
const status = document.getElementById("wishStatus");
const feed = document.getElementById("wishFeed");
const empty = document.getElementById("wishEmpty");
const renderedWishIds = new Set();

function renderWish(wish) {
  if (!wish?.message || (wish.id && renderedWishIds.has(wish.id))) return;
  if (wish.id) renderedWishIds.add(wish.id);

  empty.hidden = true;
  const card = document.createElement("article");
  card.className = "wish-card";

  const message = document.createElement("span");
  message.className = "wish-text";
  message.dir = "auto";
  message.textContent = wish.message;

  const sender = document.createElement("span");
  sender.className = "wish-from";
  sender.dir = "auto";
  sender.textContent = `— ${wish.name || "Guest"}`;

  card.replaceChildren(message, sender);
  feed.appendChild(card);
}

async function loadWishes() {
  status.textContent = "Loading wishes...";
  const { data, error } = await supabaseClient
    .from(wishesTable)
    .select("id,name,message,created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Unable to load wishes:", error.message);
    status.textContent = "We couldn't load the wishes. Please try again later.";
    return;
  }

  data.forEach(renderWish);
  status.textContent = "";
}

supabaseClient
  .channel("mohammed-menna-wishes")
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: wishesTable
  }, payload => renderWish(payload.new))
  .subscribe();

loadWishes();
