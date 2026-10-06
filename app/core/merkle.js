const crypto = require('crypto');

/**
 * Deterministically serialize any JavaScript object to a sorted JSON string
 * Safe against prototype pollution and special prototype keys
 */
function canonicalStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }
  // Filter out prototype tampering and sort keys canonically
  const keys = Object.getOwnPropertyNames(obj)
    .filter(k => k !== '__proto__' && k !== 'constructor' && k !== 'prototype')
    .sort();

  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalStringify(obj[k])).join(',') + '}';
}

/**
 * Compute SHA-256 hash of a leaf object or raw string
 */
function hashLeaf(leafData) {
  const content = typeof leafData === 'string' ? leafData : canonicalStringify(leafData);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Combine two hashes into a parent node hash
 */
function hashNodes(leftHash, rightHash) {
  // Sort children to ensure canonical binary tree structure
  const [first, second] = leftHash < rightHash ? [leftHash, rightHash] : [rightHash, leftHash];
  return crypto.createHash('sha256').update(first + second).digest('hex');
}

class MerkleTree {
  constructor(leaves = []) {
    this.rawLeaves = leaves;
    this.leafHashes = leaves.map(hashLeaf);
    this.layers = [];
    this.build();
  }

  build() {
    if (this.leafHashes.length === 0) {
      this.root = crypto.createHash('sha256').update('EMPTY_MERKLE_TREE').digest('hex');
      this.layers = [[]];
      return;
    }

    let currentLayer = [...this.leafHashes];
    this.layers = [currentLayer];

    while (currentLayer.length > 1) {
      const nextLayer = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(hashNodes(currentLayer[i], currentLayer[i + 1]));
        } else {
          // Odd leaf: pair with itself to ensure uniform binary tree
          nextLayer.push(hashNodes(currentLayer[i], currentLayer[i]));
        }
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }

    this.root = this.layers[this.layers.length - 1][0];
  }

  getRoot() {
    return this.root;
  }

  getProof(leafIndex) {
    if (leafIndex < 0 || leafIndex >= this.leafHashes.length) {
      throw new Error(`Invalid leaf index: ${leafIndex}. Total leaves: ${this.leafHashes.length}`);
    }

    const proof = [];
    let currentIndex = leafIndex;

    for (let layerIndex = 0; layerIndex < this.layers.length - 1; layerIndex++) {
      const layer = this.layers[layerIndex];
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      if (siblingIndex < layer.length) {
        proof.push({
          position: isRightNode ? 'left' : 'right',
          hash: layer[siblingIndex]
        });
      } else {
        // Paired with itself
        proof.push({
          position: 'self',
          hash: layer[currentIndex]
        });
      }

      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  static verifyProof(leafHash, proof, expectedRoot) {
    let currentHash = leafHash;

    for (const step of proof) {
      if (step.position === 'self') {
        currentHash = hashNodes(currentHash, currentHash);
      } else if (step.position === 'left') {
        currentHash = hashNodes(step.hash, currentHash);
      } else {
        currentHash = hashNodes(currentHash, step.hash);
      }
    }

    return currentHash === expectedRoot;
  }
}

module.exports = {
  MerkleTree,
  hashLeaf,
  hashNodes,
  canonicalStringify
};
