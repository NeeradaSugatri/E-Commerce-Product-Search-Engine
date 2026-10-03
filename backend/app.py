from flask import Flask, request, jsonify
import heapq
import json
from pathlib import Path

app = Flask(__name__)

# =========================================================
# LOAD PRODUCT DATA
# =========================================================

DATA_FILE = Path(__file__).with_name("products.json")

with DATA_FILE.open("r", encoding="utf-8") as file:
    products = json.load(file)


# =========================================================
# HASH TABLE
# Product ID -> Product Details
# Average lookup: O(1)
# =========================================================

product_table = {
    product["id"]: product
    for product in products
}


# =========================================================
# TRIE DATA STRUCTURE
# =========================================================

class TrieNode:

    def __init__(self):
        self.children = {}
        self.is_end = False
        self.product_ids = []


class Trie:

    def __init__(self):
        self.root = TrieNode()

    # -----------------------------------------------------
    # INSERT
    # -----------------------------------------------------

    def insert(self, word, product_id):

        node = self.root

        for char in word.lower():

            if char not in node.children:
                node.children[char] = TrieNode()

            node = node.children[char]

        node.is_end = True

        if product_id not in node.product_ids:
            node.product_ids.append(product_id)

    # -----------------------------------------------------
    # FIND PREFIX NODE
    # -----------------------------------------------------

    def find_prefix_node(self, prefix):

        node = self.root

        for char in prefix.lower():

            if char not in node.children:
                return None

            node = node.children[char]

        return node

    # -----------------------------------------------------
    # DFS: COLLECT PRODUCT IDS
    # -----------------------------------------------------

    def collect_product_ids(self, node):

        result = []

        if node.is_end:
            result.extend(node.product_ids)

        for child in node.children.values():
            result.extend(
                self.collect_product_ids(child)
            )

        return result

    # -----------------------------------------------------
    # PREFIX SEARCH
    # -----------------------------------------------------

    def search_prefix(self, prefix):

        node = self.find_prefix_node(prefix)

        if node is None:
            return []

        return self.collect_product_ids(node)


# =========================================================
# BUILD PRODUCT-NAME TRIE
#
# Each word is inserted separately so a query such as
# "pro" can match "Apple iPhone 15 Pro".
# =========================================================

product_trie = Trie()

for product in products:

    words = product["name"].lower().split()

    for word in words:
        product_trie.insert(
            word,
            product["id"]
        )


# =========================================================
# BUILD CATEGORY TRIE
# =========================================================

category_trie = Trie()

for product in products:

    category_trie.insert(
        product["category"].lower(),
        product["id"]
    )


# =========================================================
# INPUT NORMALIZATION
# =========================================================

def normalize_input(query):

    return " ".join(
        query.strip().lower().split()
    )


# =========================================================
# GET PREFIX MATCHING PRODUCT IDS
# =========================================================

def get_matching_product_ids(query):

    search_term = normalize_input(query)

    if not search_term:
        return set()

    matching_ids = set()

    # Product-name prefix match
    for word in search_term.split():

        for product_id in product_trie.search_prefix(word):
            matching_ids.add(product_id)

    # Category prefix match
    for product_id in category_trie.search_prefix(search_term):
        matching_ids.add(product_id)

    return matching_ids


# =========================================================
# CUSTOM RELEVANCE SCORE
#
# Rating      = 60%
# Popularity  = 40%
# =========================================================

def calculate_score(product):

    rating_score = (product["rating"] / 5) * 60
    popularity_score = product["popularity"] * 0.40

    return rating_score + popularity_score


# =========================================================
# PRIORITY QUEUE / HEAP
#
# Python heapq is a min-heap, so negative scores are used
# to simulate a max-heap.
# =========================================================

def rank_top_k(product_ids, k):

    heap = []

    for product_id in product_ids:

        # Hash Table lookup
        product = product_table.get(product_id)

        if product is None:
            continue

        score = calculate_score(product)

        heapq.heappush(
            heap,
            (-score, product_id)
        )

    results = []

    while heap and len(results) < k:

        negative_score, product_id = heapq.heappop(heap)

        results.append(
            product_table[product_id]
        )

    return results


# =========================================================
# MAIN SEARCH
#
# Flow:
# Normalize -> Trie -> DFS -> Hash Table -> Priority Queue
# -> Top-K
# =========================================================

def search_products(query, k=5):

    matching_ids = get_matching_product_ids(query)

    if not matching_ids:
        return []

    return rank_top_k(
        matching_ids,
        k
    )


# =========================================================
# AUTOCOMPLETE
#
# IMPORTANT:
# 1. Word-prefix matches come FIRST.
# 2. If fewer than 5 exist, substring matches fill the rest.
#
# Example:
# Query = "phone"
#
# Prefix group:
#   Phone Charger
#
# Substring group:
#   Smartphone Accessories
#   ...
# =========================================================

def get_autocomplete_suggestions(query, k=5):

    search_term = normalize_input(query)

    if not search_term:
        return []

    # ---------------------------------------------
    # GROUP 1: WORD PREFIX MATCHES
    # ---------------------------------------------

    prefix_ids = set()

    for word in search_term.split():

        for product_id in product_trie.search_prefix(word):
            prefix_ids.add(product_id)

    # Rank prefix matches first.
    prefix_results = rank_top_k(
        prefix_ids,
        k
    )

    prefix_result_ids = {
        product["id"]
        for product in prefix_results
    }

    # ---------------------------------------------
    # GROUP 2: SUBSTRING MATCHES
    # ---------------------------------------------
    #
    # Only used to fill remaining suggestion slots.
    # These products contain the query but do not have
    # a product-name word beginning with the query.
    # ---------------------------------------------

    substring_ids = set()

    for product in products:

        name = product["name"].lower()

        if search_term in name:

            if product["id"] not in prefix_ids:
                substring_ids.add(product["id"])

    remaining = k - len(prefix_results)

    substring_results = rank_top_k(
        substring_ids,
        remaining
    )

    return prefix_results + substring_results


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return (
        "E-Commerce Product Search Engine "
        "Backend is running!"
    )


# =========================================================
# ALL PRODUCTS
# =========================================================

@app.route("/api/products", methods=["GET"])
def get_products():

    return jsonify(products)


# =========================================================
# SEARCH API
# =========================================================

@app.route("/api/search", methods=["GET"])
def search():

    query = request.args.get("q", "")

    try:
        k = int(request.args.get("k", 5))
    except ValueError:
        k = 5

    if k <= 0:
        k = 5

    k = min(k, len(products))

    results = search_products(
        query,
        k
    )

    return jsonify({
        "query": query,
        "count": len(results),
        "results": results
    })


# =========================================================
# AUTOCOMPLETE API
# =========================================================

@app.route("/api/suggestions", methods=["GET"])
def suggestions():

    query = request.args.get("q", "")

    results = get_autocomplete_suggestions(
        query,
        5
    )

    return jsonify(results)


# =========================================================
# DEBUG / ALGORITHM DEMONSTRATION API
# =========================================================

@app.route("/api/debug/search", methods=["GET"])
def debug_search():

    query = request.args.get("q", "")
    normalized_query = normalize_input(query)

    matching_ids = get_matching_product_ids(
        normalized_query
    )

    hash_table_results = []

    for product_id in matching_ids:

        product = product_table.get(product_id)

        if product is not None:

            hash_table_results.append({
                "id": product["id"],
                "name": product["name"]
            })

    scored_products = []

    for product_id in matching_ids:

        product = product_table.get(product_id)

        if product is None:
            continue

        scored_products.append({
            "id": product["id"],
            "name": product["name"],
            "score": calculate_score(product)
        })

    top_k_results = rank_top_k(
        matching_ids,
        5
    )

    return jsonify({
        "query": query,
        "normalized_query": normalized_query,

        "algorithm": {
            "step_1": "Normalize input",
            "step_2": "Trie prefix traversal",
            "step_3": "DFS collection of matching Product IDs",
            "step_4": "Hash Table lookup",
            "step_5": "Priority Queue ranking",
            "step_6": "Top-K extraction"
        },

        "matching_product_ids": sorted(
            matching_ids
        ),

        "hash_table_lookup": hash_table_results,

        "scored_products": scored_products,

        "top_k_results": top_k_results
    })


# =========================================================
# CORS
# =========================================================

@app.after_request
def add_cors_headers(response):

    response.headers[
        "Access-Control-Allow-Origin"
    ] = "*"

    response.headers[
        "Access-Control-Allow-Headers"
    ] = "Content-Type"

    response.headers[
        "Access-Control-Allow-Methods"
    ] = "GET, OPTIONS"

    return response


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )
