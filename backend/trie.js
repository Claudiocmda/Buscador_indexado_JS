// backend/trie.js
class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.word = null;
        this.popularity = 0;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word, popularity) {
        let node = this.root;
        for (let char of word.toLowerCase()) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
        node.word = word;
        node.popularity = popularity;
    }

    searchPrefix(prefix) {
        let node = this.root;
        for (let char of prefix.toLowerCase()) {
            if (!node.children[char]) return [];
            node = node.children[char];
        }
        return this._collectSuggestions(node);
    }

    _collectSuggestions(node) {
        const suggestions = [];

        const dfs = (n) => {
            if (n.isEndOfWord) {
                suggestions.push({ name: n.word, followers: n.popularity });
            }
            for (let char in n.children) {
                dfs(n.children[char]);
            }
        };

        dfs(node);
        suggestions.sort((a, b) => b.followers - a.followers);
        return suggestions.map(s => s.name);
    }
}

module.exports = Trie;
