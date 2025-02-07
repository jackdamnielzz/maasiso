import { Compiler, Stats } from 'webpack';

const BUDGET_LIMITS = {
  TOTAL: 250 * 1024, // 250KB total bundle limit
  INITIAL: 100 * 1024, // 100KB initial bundle limit
  ASYNC: 50 * 1024, // 50KB async chunk limit
};

export class BundleBudgetPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.done.tap('BundleBudgetPlugin', (stats: Stats) => {
      const { assets } = stats.toJson();
      
      if (!assets) {
        console.warn('No assets found in bundle');
        return;
      }

      let totalSize = 0;
      let initialSize = 0;
      let asyncSize = 0;

      assets.forEach(asset => {
        const size = asset.size;
        totalSize += size;

        // Initial chunks are usually named main.js, vendor.js, etc.
        if (asset.name.match(/^(main|vendor|framework|commons)\.[a-f0-9]+\.js$/)) {
          initialSize += size;
        }
        // Async chunks usually have a numeric identifier
        else if (asset.name.match(/^\d+\.[a-f0-9]+\.js$/)) {
          asyncSize += size;
        }
      });

      console.log('\n=== Bundle Size Analysis ===');
      console.log(`Total Bundle Size: ${(totalSize / 1024).toFixed(2)}KB`);
      console.log(`Initial Bundle Size: ${(initialSize / 1024).toFixed(2)}KB`);
      console.log(`Async Chunks Size: ${(asyncSize / 1024).toFixed(2)}KB`);

      // Check against budgets
      if (totalSize > BUDGET_LIMITS.TOTAL) {
        console.warn(`⚠️ Total bundle size exceeds budget: ${(totalSize / 1024).toFixed(2)}KB > ${(BUDGET_LIMITS.TOTAL / 1024)}KB`);
      }
      if (initialSize > BUDGET_LIMITS.INITIAL) {
        console.warn(`⚠️ Initial bundle size exceeds budget: ${(initialSize / 1024).toFixed(2)}KB > ${(BUDGET_LIMITS.INITIAL / 1024)}KB`);
      }
      if (asyncSize > BUDGET_LIMITS.ASYNC) {
        console.warn(`⚠️ Async chunks size exceeds budget: ${(asyncSize / 1024).toFixed(2)}KB > ${(BUDGET_LIMITS.ASYNC / 1024)}KB`);
      }

      // List largest chunks
      console.log('\nLargest Chunks:');
      assets
        .filter(asset => asset.name.endsWith('.js'))
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
        .forEach(asset => {
          console.log(`${asset.name}: ${(asset.size / 1024).toFixed(2)}KB`);
        });
    });
  }
}
