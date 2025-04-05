import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import toast, { Toaster } from "react-hot-toast";
import { toPng, toSvg } from "html-to-image";

const QRGenerator = () => {
    const [qrType, setQrType] = useState("websiteUrl");
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [size, setSize] = useState(256);
    const [formValues, setFormValues] = useState({});
    const [correctionLevel, setCorrectionLevel] = useState("Q");
    const [logoSrc, setLogoSrc] = useState();
    const qrRef = useRef();

    const handleFieldChange = (field, value) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const generateQRData = () => {
        switch (qrType) {
            case "websiteUrl":
                return formValues.url || "";
            case "contactInfo":
                return `BEGIN:VCARD\nVERSION:3.0\nN:${
                    formValues.name || ""
                }\nEMAIL:${formValues.email || ""}\nTEL:${
                    formValues.phone || ""
                }\nEND:VCARD`;
            case "wifiLogin":
                return `WIFI:S:${formValues.ssid || ""};T:${
                    formValues.encryption || "WPA"
                };P:${formValues.password || ""};;`;
            case "event":
                return `BEGIN:VEVENT\nSUMMARY:${
                    formValues.title || ""
                }\nLOCATION:${formValues.location || ""}\nDTSTART:${
                    formValues.date || ""
                }\nEND:VEVENT`;
            case "emailSMS":
                return formValues.type === "email"
                    ? `mailto:${formValues.recipient || ""}?subject=${
                          formValues.subject || ""
                      }&body=${formValues.body || ""}`
                    : `SMSTO:${formValues.recipient || ""}:${
                          formValues.body || ""
                      }`;
            case "plainText":
                return formValues.text || "";
        }
    };

    const renderFields = () => {
        switch (qrType) {
            case "websiteUrl":
                return (
                    <input
                        type="url"
                        placeholder="Enter website URL"
                        value={formValues.url || ""}
                        onChange={(e) =>
                            handleFieldChange("url", e.target.value)
                        }
                        className="input"
                    />
                );
            case "contactInfo":
                return (
                    <>
                        <input
                            placeholder="Name"
                            value={formValues.name || ""}
                            onChange={(e) =>
                                handleFieldChange("name", e.target.value)
                            }
                            className="input"
                        />
                        <input
                            placeholder="Email"
                            value={formValues.email || ""}
                            onChange={(e) =>
                                handleFieldChange("email", e.target.value)
                            }
                            className="input"
                        />
                        <input
                            placeholder="Phone"
                            value={formValues.phone || ""}
                            onChange={(e) =>
                                handleFieldChange("phone", e.target.value)
                            }
                            className="input"
                        />
                    </>
                );
            case "wifiLogin":
                return (
                    <>
                        <input
                            placeholder="Wi-Fi Name (SSID)"
                            value={formValues.ssid || ""}
                            onChange={(e) =>
                                handleFieldChange("ssid", e.target.value)
                            }
                            className="input"
                        />
                        <input
                            placeholder="Password"
                            value={formValues.password || ""}
                            onChange={(e) =>
                                handleFieldChange("password", e.target.value)
                            }
                            className="input"
                        />
                        <select
                            value={formValues.encryption || "WPA"}
                            onChange={(e) =>
                                handleFieldChange("encryption", e.target.value)
                            }
                            className="input"
                        >
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">None</option>
                        </select>
                    </>
                );
            case "event":
                return (
                    <>
                        <input
                            placeholder="Event Title"
                            value={formValues.title || ""}
                            onChange={(e) =>
                                handleFieldChange("title", e.target.value)
                            }
                            className="input"
                        />
                        <input
                            type="date"
                            value={formValues.date || ""}
                            onChange={(e) =>
                                handleFieldChange("date", e.target.value)
                            }
                            className="input"
                        />
                        <input
                            placeholder="Location"
                            value={formValues.location || ""}
                            onChange={(e) =>
                                handleFieldChange("location", e.target.value)
                            }
                            className="input"
                        />
                    </>
                );
            case "emailSMS":
                return (
                    <>
                        <select
                            value={formValues.type || "email"}
                            onChange={(e) =>
                                handleFieldChange("type", e.target.value)
                            }
                            className="input"
                        >
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                        </select>
                        <input
                            placeholder="Recipient"
                            value={formValues.recipient || ""}
                            onChange={(e) =>
                                handleFieldChange("recipient", e.target.value)
                            }
                            className="input"
                        />
                        {formValues.type === "email" ? (
                            <>
                                <input
                                    placeholder="Subject"
                                    value={formValues.subject || ""}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "subject",
                                            e.target.value,
                                        )
                                    }
                                    className="input"
                                />
                                <textarea
                                    placeholder="Body"
                                    value={formValues.body || ""}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "body",
                                            e.target.value,
                                        )
                                    }
                                    className="input"
                                />
                            </>
                        ) : (
                            <textarea
                                placeholder="Message"
                                value={formValues.body || ""}
                                onChange={(e) =>
                                    handleFieldChange("body", e.target.value)
                                }
                                className="input"
                            />
                        )}
                    </>
                );
            case "plainText":
            default:
                return (
                    <textarea
                        placeholder="Enter plain text"
                        value={formValues.text || ""}
                        onChange={(e) =>
                            handleFieldChange("text", e.target.value)
                        }
                        className="input"
                    />
                );
        }
    };

    const handleCopy = async () => {
        if (!generateQRData()) {
            toast.error("No data to copy.");
            return;
        }
        try {
            await navigator.clipboard.writeText(generateQRData());
            toast.success("Copied to Clipboard.");
        } catch (error) {
            console.log("Error Copying data: ", error);
            toast.error("Error copying.");
        }
    };

    const handleDownload = async (type = "png") => {
        if (!qrRef.current) return;
        const filename = `qr-code.${type}`;

        try {
            if (type === "png") {
                const dataUrl = await toPng(qrRef.current);
                const link = document.createElement("a");
                link.download = filename;
                link.href = dataUrl;
                link.click();
            } else if (type === "svg") {
                const dataUrl = await toSvg(qrRef.current);
                const link = document.createElement("a");
                link.download = filename;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.log("Error downloading file", error);
            toast.error("Error Downloading file");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 text-center">
                    QR Code Generator
                </h1>

                {/* QR Type Selector */}
                <div className="space-y-2">
                    <label
                        htmlFor="qr-type-selector"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Choose Type
                    </label>
                    <select
                        name="qr-type"
                        id="qr-type-selector"
                        className="mt-1 block w-full p-2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={qrType}
                        onChange={(e) => setQrType(e.target.value)}
                    >
                        <option value="websiteUrl">Website URL</option>
                        <option value="contactInfo">
                            Contact Info (Name, Email, Phone)
                        </option>
                        <option value="wifiLogin">Wi-Fi Login</option>
                        <option value="event">
                            Event (Title, Date, Location)
                        </option>
                        <option value="emailSMS">Email / SMS</option>
                        <option value="plainText">Plain Text</option>
                    </select>
                </div>

                {/* Data Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Enter Data
                    </label>
                    <div className="space-y-2">{renderFields()}</div>
                </div>

                {/* Customization Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Foreground Color
                        </label>
                        <input
                            type="color"
                            className="w-full h-10 rounded-lg border border-gray-300 p-1"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Background Color
                        </label>
                        <input
                            type="color"
                            className="w-full h-10 rounded-lg border border-gray-300 p-1"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Size (px)
                        </label>
                        <input
                            type="number"
                            min="56"
                            max="1080"
                            className="w-full rounded-lg border border-gray-300 p-2"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Error Correction Level
                        </label>
                        <select
                            className="w-full rounded-lg border-gray-300 p-2"
                            value={correctionLevel}
                            onChange={(e) => setCorrectionLevel(e.target.value)}
                        >
                            <option value="L">L - Low</option>
                            <option value="M">M - Medium</option>
                            <option value="Q">Q - Quartile</option>
                            <option value="H">H - High</option>
                        </select>
                    </div>
                </div>

                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Logo (Optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        className="input block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setLogoSrc(reader.result);
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                </div>

                {/* QR Code Preview with logo overlay */}
                <div className="flex justify-center">
                    <div className="relative bg-white p-4 rounded-lg shadow">
                        {/*  */}
                        <QRCodeCanvas
                            ref={qrRef}
                            value={generateQRData()}
                            size={size}
                            bgColor={bgColor}
                            fgColor={fgColor}
                            level={correctionLevel}
                            imageSettings={{
                                src: logoSrc,
                                x: undefined,
                                y: undefined,
                                height: 24,
                                width: 24,
                                opacity: 1,
                                excavate: true,
                            }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition font-medium"
                            onClick={handleCopy}
                        >
                            Copy QR Data
                        </button>
                        <button
                            className="bg-white text-indigo-600 border border-indigo-600 px-6 py-2 rounded-xl hover:bg-indigo-50 transition font-medium"
                            onClick={() => handleDownload("png")}
                        >
                            Download PNG
                        </button>
                        <button
                            className="bg-white text-indigo-600 border border-indigo-600 px-6 py-2 rounded-xl hover:bg-indigo-50 transition font-medium"
                            onClick={() => handleDownload("svg")}
                        >
                            Download SVG
                        </button>
                    </div>
                    <Toaster />
                </div>
            </div>
        </div>
    );
};

export default QRGenerator;
