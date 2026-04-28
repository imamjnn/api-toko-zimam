import {getAllPrinters, getDefaultPrinter, getPrinterByName} from '@printers/printers';
import {exec} from 'child_process';
import {formatRupiah, formatText} from '../../utils/formatter';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const getPrinter = async (req, res) => {
  const printers = await getAllPrinters();
  const defaultPrinter = await getDefaultPrinter();
  console.log(
    'Available printers:',
    printers.map(p => p.name),
  );

  res.json({message: 'Barcode printed successfully', defaultPrinter});
};

export const printBarcode = async (req, res) => {
  const {products, leftColX = 20, rightColX = 360, height = 20, width = 83, gap = 2} = req.body;

  const defaultPrinter = await getDefaultPrinter();

  try {
    let tspl = `
    SIZE ${width} mm, ${height} mm
    GAP ${gap} mm, 0 mm
    DIRECTION 1,0
    REFERENCE 0,0
    OFFSET 0 mm
    DENSITY 10
    CLS
    `;

    // const leftColX = 20; // Koordinat X kolom kiri
    // const rightColX = 360; // Koordinat X kolom kanan (sesuaikan jika perlu)
    for (let i = 0; i < products.length; i += 2) {
      const p1 = products[i];
      const p2 = products[i + 1];

      tspl += `CLS\n`; // Bersihkan setiap kali akan mencetak baris baru

      // Label Kiri
      if (p1) {
        tspl += `BARCODE ${leftColX},10,"128",56,2,0,2,2,"${p1.product_code}"\n`;
        tspl += `TEXT ${leftColX},96,"1",0,1,1,"${formatText(p1.name, 20)}"\n`;
        tspl += `TEXT ${leftColX},120,"1",0,2,2,"${formatRupiah(p1.price)}"\n`;
      }

      // Label Kanan
      if (p2) {
        tspl += `BARCODE ${rightColX},10,"128",56,2,0,2,2,"${p2.product_code}"\n`;
        tspl += `TEXT ${rightColX},96,"1",0,1,1,"${formatText(p2.name, 20)}"\n`;
        tspl += `TEXT ${rightColX},120,"1",0,2,2,"${formatRupiah(p2.price)}"\n`;
      }

      tspl += `PRINT 1\n`;
    }

    // Nama printer share (sesuaikan dengan nama yang Anda buat di tab Sharing)
    const shareName = 'XP420B';
    const computerName = 'localhost'; // atau nama komputer Anda

    const tempFilePath = path.join(os.tmpdir(), `barcode_${Date.now()}.txt`);

    // Pastikan file temp ditulis dengan encoding 'ascii' atau 'utf8' tanpa BOM
    fs.writeFileSync(tempFilePath, tspl, 'utf8');

    const isWindows = process.platform === 'win32';

    // Gunakan perintah copy /b (binary) ke path jaringan lokal printer
    const command = isWindows
      ? `copy /b "${tempFilePath}" "\\\\${computerName}\\${shareName}"`
      : `echo '${tspl}' | lpr -P "${defaultPrinter.systemName}" -o raw`;

    exec(command, (err, stdout, stderr) => {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      if (err) {
        return res.json({
          status: 'error',
          message: err.message,
        });
      }

      return res.json({
        status: 'success',
        message: 'Print TSPL berhasil',
        tspl,
      });
    });
  } catch (error) {
    return res.json({
      status: 'error',
      message: error.message,
      defaultPrinter,
    });
  }
};
