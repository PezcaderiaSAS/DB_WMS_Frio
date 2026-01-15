const PDFService = {
  generarReciboAgrupado: function(data) {
    // data = { id_movimiento, fecha, cliente, tipo, items: [] }
    const template = HtmlService.createTemplateFromFile('Plantilla_Recibo_Batch');
    template.data = data; // Pasamos todo el objeto

    const htmlBody = template.evaluate().getContent();
    const blob = Utilities.newBlob(htmlBody, 'text/html', data.id_movimiento + ".html");
    const pdfBlob = blob.getAs('application/pdf').setName(data.id_movimiento + ".pdf");
    
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_RECIBOS_ID);
    const file = folder.createFile(pdfBlob);
    return file.getUrl();
  }
};