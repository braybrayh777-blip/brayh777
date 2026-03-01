// extract7z.js - Worker script for 7z decompression in EmulatorJS
// This is the standard version from the EmulatorJS project (uncompressed, plain JS)

self.importScripts('https://cdn.jsdelivr.net/npm/@zip.js/zip.js@2.7.6/dist/zip.min.js');

self.onmessage = async function(e) {
    const { data, type } = e.data;

    if (type === 'decompress') {
        try {
            const zipReader = new zip.ZipReader(new zip.BlobReader(data));
            const entries = await zipReader.getEntries();

            for (const entry of entries) {
                if (entry.filename.endsWith('.data')) {
                    const blob = await entry.getData(new zip.BlobWriter());
                    self.postMessage({ type: 'result', blob });
                    await zipReader.close();
                    return;
                }
            }

            self.postMessage({ type: 'error', message: 'No .data file found in archive' });
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message });
        }
    }
};
