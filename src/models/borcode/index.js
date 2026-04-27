import {getAllPrinters, getDefaultPrinter} from '@printers/printers';
import {exec} from 'child_process';
import {promisify} from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {formatRupiah} from '../../utils/formatter';

const execAsync = promisify(exec);

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
  const {products} = req.body;

  const defaultPrinter = await getDefaultPrinter();

  try {
    let tspl = `
SIZE 80 mm, 20 mm
GAP 1 mm, 0 mm
DIRECTION 1,0
REFERENCE 0,0
OFFSET 0 mm
DENSITY 10
CLS
`;

    const leftColX = 20; // Koordinat X kolom kiri
    const rightColX = 360; // Koordinat X kolom kanan (sesuaikan jika perlu)

    for (let i = 0; i < products.length; i += 2) {
      const p1 = products[i];
      const p2 = products[i + 1];

      tspl += `CLS\n`; // Bersihkan setiap kali akan mencetak baris baru

      // Label Kiri
      if (p1) {
        tspl += `BARCODE ${leftColX},10,"128",56,2,0,2,2,"${p1.product_code}"\n`;
        tspl += `TEXT ${leftColX},96,"1",0,1,1,"${p1.name.substring(0, 20)}"\n`;
        tspl += `TEXT ${leftColX},120,"1",0,2,2,"${formatRupiah(p1.price)}"\n`;
      }

      // Label Kanan
      if (p2) {
        tspl += `BARCODE ${rightColX},10,"128",56,2,0,2,2,"${p2.product_code}"\n`;
        tspl += `TEXT ${rightColX},96,"1",0,1,1,"${p2.name.substring(0, 20)}"\n`;
        tspl += `TEXT ${rightColX},120,"1",0,2,2,"${formatRupiah(p2.price)}"\n`;
      }

      tspl += `PRINT 1\n`;
    }

    // Detect OS dan gunakan command yang sesuai
    const platform = os.platform();
    let printCommand;

    if (platform === 'win32') {
      // Windows: save to temp file dan gunakan powershell
      const tempFile = path.join(os.tmpdir(), `tspl_${Date.now()}.txt`);
      fs.writeFileSync(tempFile, tspl);

      // Escape quotes untuk PowerShell
      const printerName = defaultPrinter.systemName.replace(/"/g, '\\"');
      printCommand = `powershell -Command "Get-Content '${tempFile}' | Out-Printer -Name '${printerName}'"`;
    } else {
      // macOS/Linux: gunakan lpr
      printCommand = `echo '${tspl}' | lpr -P "${defaultPrinter.systemName}" -o raw`;
    }

    console.log('Platform:', platform);
    console.log('Print command:', printCommand);

    await execAsync(printCommand);

    return res.json({
      status: 'success',
      message: 'Print TSPL berhasil',
      defaultPrinter,
      platform,
    });
  } catch (error) {
    console.error('Print error:', error);
    return res.json({
      status: 'error',
      message: error.message,
      defaultPrinter,
    });
  }
};
