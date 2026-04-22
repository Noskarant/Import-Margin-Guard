const major = Number(process.versions.node.split('.')[0]);

if (Number.isNaN(major)) {
  process.exit(0);
}

if (major >= 25) {
  console.error('Import Margin Guard requires Node < 25 for Next.js 15 runtime stability.');
  console.error(`Detected Node ${process.versions.node}. Please switch to Node 22 or 24.`);
  process.exit(1);
}
