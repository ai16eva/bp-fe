import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const metadataString = formData.get('metadata') as string | null;

        const pinataApiKey = process.env.PINATA_API_KEY;
        const pinataSecretKey = process.env.PINATA_SECRET_API_KEY;

        if (!pinataApiKey || !pinataSecretKey) {
            return NextResponse.json(
                { error: 'Pinata configuration missing' },
                { status: 500 }
            );
        }

        // 1. Upload Image if present
        let ipfsHash = '';
        if (file) {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const metadata = JSON.stringify({
                name: file.name,
            });
            uploadData.append('pinataMetadata', metadata);
            uploadData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

            const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretKey,
                },
                body: uploadData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Pinata Image Upload Error:', errorText);
                throw new Error(`Failed to upload image to Pinata: ${res.statusText}`);
            }

            const data = await res.json();
            ipfsHash = data.IpfsHash;
        }

        // 2. Upload Metadata JSON if present

        if (metadataString) {
            const metadataJson = JSON.parse(metadataString);

            // If an image was just uploaded, update the image field
            if (ipfsHash) {
                metadataJson.image = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
                if (metadataJson.properties?.files?.[0]) {
                    metadataJson.properties.files[0].uri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
                }
            }

            const uploadData = JSON.stringify({
                pinataOptions: { cidVersion: 0 },
                pinataMetadata: { name: metadataJson.name ? `${metadataJson.name}_metadata.json` : 'metadata.json' },
                pinataContent: metadataJson,
            });

            const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretKey,
                },
                body: uploadData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Pinata Metadata Upload Error:', errorText);
                throw new Error(`Failed to upload metadata to Pinata: ${res.statusText}`);
            }

            const data = await res.json();
            return NextResponse.json({
                success: true,
                ipfsHash: data.IpfsHash,
                uri: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
            });
        }

        // If only image was uploaded
        if (ipfsHash) {
            return NextResponse.json({
                success: true,
                imageIpfsHash: ipfsHash,
                imageUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
            });
        }

        return NextResponse.json(
            { error: 'No file or metadata provided' },
            { status: 400 }
        );

    } catch (error: any) {
        console.error('Upload API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
