import { HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FilterMetadata, LazyLoadEvent, MessageService } from 'primeng/api';
import { RestService } from '../service/rest.service';
import { TableListResponse } from './TableListResponse';
import { UploadResponse } from './UploadResponse';

@Component({
    selector: 'app-file-transfer-prime-ng',
    templateUrl: './file-transfer.component.html',
    styleUrls: ['./file-transfer.component.css']
})
export class FileTransferComponent implements OnInit {

    //file: File = {} as File
    fileName: string = ''
    fileSize: number = 0
    truncateTable: boolean = false
    uploadProgressMessage: string = ''
    exceptionsFileDownloadProgressMessage: string = ''
    tableFileDownloadProgressMessage: string = ''
    uploadResponse: UploadResponse = {} as UploadResponse
    fileHasExceptions: boolean = false

    tableList: string[] = {} as string[];//= ['sales', 'sales2', 'sales3', 'bio_stats']
    selectedTable: string = ''
    showTable: boolean = false
    tableRows = [{}]
    totalRowCount: number = 0
    loadingStatus: boolean = false;
    columns: { name: string; header: string; order: number; format: string, filterable: boolean, type: string, fractionDigits: number }[] = [];
    tableFileName: string = ''
    sortColumns: Array<string> = []

    constructor(
        private restService: RestService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.restService.getTableList()
            .subscribe((data: TableListResponse) => {
                this.tableList = data.tableList
                // console.log(this.tableList)
                console.log(this.tableList)
            });
    }

    onChangeTable(event: any) {
        this.truncateTable = false
        this.showTable = false
        this.tableRows = []
    }

    onSelectFile(event: any): void {
        console.log('onSelect')
        const file: File = event.files[0]
        this.fileName = file.name
        this.fileSize = file.size

        this.uploadProgressMessage = ''
        this.exceptionsFileDownloadProgressMessage = ''
        this.tableFileDownloadProgressMessage = ''
        this.uploadResponse = {} as UploadResponse
        this.fileHasExceptions = false
        this.truncateTable = false
        this.messageService.clear()
    }

    onUploadFile(event: any, uploadComponent: any) {
        console.log('onUploadFile')
        console.log(`event: ${event}, uploadComponent: ${uploadComponent}`)
        this.messageService.clear()
        const file: File = event.files[0]
        this.fileHasExceptions = false;

        this.showTable = false

        console.log('file', file)
        if (file) {
            this.fileName = file.name
            this.fileSize = file.size
            const formData = new FormData()
            formData.append('csvFile', file, this.fileName)
            formData.append('tableName', this.selectedTable)
            formData.append('truncateTable', String(this.truncateTable))
            console.log('formData', formData)
            this.restService.uploadFile(formData)
                .subscribe(
                    {
                        next: (httpEvent: HttpEvent<UploadResponse>) => {
                            console.log(httpEvent);
                            switch (httpEvent.type) {
                                case HttpEventType.Sent:
                                    this.uploadProgressMessage = `Uploading file "${this.fileName}" of size ${this.fileSize}.`
                                    break
                                case HttpEventType.UploadProgress:
                                    if (httpEvent.total) {
                                        const percentComplete = Math.round(100 * (httpEvent.loaded / httpEvent.total))
                                        this.uploadProgressMessage = `File "${this.fileName}" is ${percentComplete}% uploaded.`
                                    }
                                    break
                                case HttpEventType.Response:
                                    this.uploadResponse = httpEvent.body as UploadResponse;
                                    this.uploadProgressMessage = `File "${this.fileName}" is uploaded.`
                                    console.log('uploadResponse', this.uploadResponse)
                                    //if (this.uploadResponse.exceptionsFileName) {
                                    if (/*this.uploadResponse.transformerExceptionMessage || */
                                        this.uploadResponse.exceptionsFileName) {
                                        this.fileHasExceptions = true;
                                        this.uploadProgressMessage = this.uploadProgressMessage = `File "${this.fileName}" is uploaded, with errors.`
                                    }
                                    break
                            }
                        },
                        complete: () => {
                            uploadComponent.clear() // clear the selected file in component
                            this.messageService.clear()
                            this.messageService.add({ severity: this.fileHasExceptions ? 'warn' : 'info', summary: '200', detail: this.uploadProgressMessage })

                            this.showTable = true
                        },
                        error: (httpErrorResponse: HttpErrorResponse) => {
                            console.error('httpErrorResponse', httpErrorResponse)
                            this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                        }
                    });
        }
    }

    onDownloadExceptionsFile(event: any): void {
        console.log('onDownloadExceptionsFile')
        this.messageService.clear()
        this.restService.downloadExceptionsFile(this.uploadResponse.exceptionsFileName)
            .subscribe(
                {
                    next: (httpEvent: HttpEvent<Blob>) => {
                        // console.log(data.text())
                        // var csvUrl = URL.createObjectURL(data)
                        // console.log('csvUrl', csvUrl)
                        // window.open(csvUrl)
                        console.log('httpEvent.type.type', httpEvent.type);
                        switch (httpEvent.type) {
                            case HttpEventType.Sent:
                                console.log('HttpEventType.Sent')
                                this.exceptionsFileDownloadProgressMessage = 'Downloading exceptions file ...'
                                break
                            case HttpEventType.DownloadProgress:
                                console.log('HttpEventType.DownloadProgress')
                                if (httpEvent.total) {
                                    const percentComplete = Math.round(100 * (httpEvent.loaded / httpEvent.total))
                                    this.exceptionsFileDownloadProgressMessage = `Exceptions file is ${percentComplete}% downloaded.`
                                }
                                break
                            case HttpEventType.Response:
                                console.log('HttpEventType.Response')
                                console.log('httpEvent.headers', httpEvent.headers)
                                const exceptionsFileName = this.downloadFile(httpEvent)
                                this.exceptionsFileDownloadProgressMessage = `File "${exceptionsFileName}" is downloaded.`
                                break;
                        }

                    },
                    complete: () => {

                        this.messageService.clear()
                        this.messageService.add({ severity: 'info', summary: '200', detail: this.exceptionsFileDownloadProgressMessage })
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        console.error('httpErrorResponse', httpErrorResponse)
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    }
                });
    }

    onDownloadTable(event: any): void {
        console.log('onDownloadTable')
        this.messageService.clear()
        this.restService.downloadTable(this.selectedTable)
            .subscribe(
                {
                    next: (httpEvent: HttpEvent<Blob>) => {
                        // console.log(data.text())
                        // var csvUrl = URL.createObjectURL(data)
                        // console.log('csvUrl', csvUrl)
                        // window.open(csvUrl)
                        console.log('httpEvent.type.type', httpEvent.type);
                        switch (httpEvent.type) {
                            case HttpEventType.Sent:
                                console.log('HttpEventType.Sent')
                                this.tableFileDownloadProgressMessage = `Preparing ${this.selectedTable} table for download:`
                                break
                            case HttpEventType.DownloadProgress:
                                console.log('HttpEventType.DownloadProgress')
                                if (httpEvent.total) {
                                    const percentComplete = Math.round(100 * (httpEvent.loaded / httpEvent.total))
                                    this.tableFileDownloadProgressMessage = `${this.selectedTable} table is ${percentComplete}% downloaded.`
                                }
                                break
                            case HttpEventType.Response:
                                console.log('HttpEventType.Response')
                                console.log('httpEvent.headers', httpEvent.headers)
                                this.tableFileName = this.downloadFile(httpEvent)
                                this.tableFileDownloadProgressMessage = ''
                                break;
                        }

                    },
                    complete: () => {
                        this.messageService.clear()
                        this.uploadProgressMessage = '';
                        this.uploadResponse = {} as UploadResponse;
                        this.messageService.add({ severity: 'info', summary: '200', detail: `File "${this.tableFileName}" is downloaded.` })
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        console.error('httpErrorResponse', httpErrorResponse)
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    }
                });
    }

    onBrowseTable(event: any): void {
        console.log('onBrowseTable')
        this.messageService.clear()
        //this.showTable = true
        //this.fetchPage({});
        this.sortColumns = []

        console.log('before getTableMetaDataAlps')
        this.restService.getTableMetaDataAlps(this.selectedTable)
            .subscribe(
                {
                    next: (metaData: any) => {
                        console.log('alps metaData', metaData)
                        const alpsDescriptors = metaData.alps.descriptor
                        console.log('alps alpsDescriptors', alpsDescriptors)
                        const representationDescriptorId = RestService.toCamelCase(this.selectedTable) + '-representation';
                        const representationDescriptor = alpsDescriptors.find((descriptor: { id: string; }) => descriptor.id = representationDescriptorId)
                        console.log('representationDescriptor', representationDescriptor)
                        const columnDescriptors = representationDescriptor.descriptor
                        console.log('columnDescriptors', columnDescriptors)
                        this.columns = []
                        columnDescriptors.forEach((descriptor: any) => {
                            console.log(descriptor.name, descriptor.doc?.value)
                            const columnName = descriptor.name
                            if (columnName === 'version') return // skip version column
                            let columnAttributesMap = new Map()

                            if (descriptor.doc?.value) {
                                const columnAttributesArray: string[] = descriptor.doc?.value.split(',')
                                columnAttributesArray.forEach(columnAttribute => {
                                    const tuple = columnAttribute.split('=')
                                    columnAttributesMap.set(tuple[0], tuple[1])
                                })
                            }
                            console.log('columnAttributesMap', columnAttributesMap)
                            // 1) title attribute
                            let header: string = columnAttributesMap.get('title')
                            // If title attribute is not specified use the column name to generate the header
                            if (! /* not */ header) {
                                // use column name to generate a header. eq firstName => First Name
                                header = columnName[0].toUpperCase() + columnName.slice(1)
                                header = header.replace(/([A-Z])/g, ' $1').trim()
                            }
                            // 2) columnDisplayOrder attribute
                            let columnOrder: number = columnAttributesMap.get('columnDisplayOrder')
                            // 3) format attribute
                            let format: string = columnAttributesMap.get('format')
                            // 4) filterable attribute
                            let filterable: boolean = columnAttributesMap.get('filterable')
                            // 5) type attribute (text, numeric, boolean or date) see https://www.primefaces.org/primeng-v14-lts/table#:~:text=p%2DcolumnFilter%20component.-,Data%20Types,-ColumnFilter%20requires%20a
                            let type: string = columnAttributesMap.get('type')
                            // 6) fractionDigits attribute
                            let fractionDigits: number = columnAttributesMap.get('fractionDigits')


                            this.columns.push({ name: columnName, header: header, order: columnOrder ?? 1, format: format, filterable: filterable, type: type, fractionDigits: fractionDigits })
                            // 7) sortOrder and sortDirection attributes
                            if (columnAttributesMap.get('sortOrder')) {
                                const sortOrder: number = columnAttributesMap.get('sortOrder')
                                console.log('sortOrder', sortOrder)
                                this.sortColumns[sortOrder] = columnName
                                if (columnAttributesMap.get('sortDirection')) {
                                    const sortDirection: string = columnAttributesMap.get('sortDirection')
                                    console.log('sortDirection', sortDirection)
                                    this.sortColumns[sortOrder] = this.sortColumns[sortOrder] + "," + sortDirection
                                }
                            }
                        });
                        console.log('this.columns', this.columns)
                        this.columns.sort((a, b) => a.order > b.order ? 1 : -1)
                        console.log('this.columns sorted', this.columns)
                    },
                    complete: () => {
                        this.showTable = true
                    },
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    }

                }
            )

    }
    fetchPage(lazyLoadEvent: LazyLoadEvent) {
        console.log(lazyLoadEvent)
        this.loadingStatus = true
        const pageSize = lazyLoadEvent.rows ?? 20
        const pageNumber = (lazyLoadEvent.first ?? 0) / pageSize;
        //const filters: { [s: string]: FilterMetadata[] } | undefined = lazyLoadEvent.filters
        const filters: any = lazyLoadEvent.filters
        console.log('filters', filters)
        console.log('pageNumber', pageNumber, 'pageSize', pageSize, 'filters', filters)
        let searchCriteria: string = ''
        if (filters) {
            console.log('Object.keys(filters)', Object.keys(filters))
            Object.keys(filters).forEach(columnName => {
                console.log('columeName', columnName, 'matchMode', filters[columnName][0].matchMode, 'value', filters[columnName][0].value)
                //searchCriteria += columnName + filters[columnName][0].matchMode + filters[columnName][0].value + ","
                if (filters[columnName][0].value) {
                    searchCriteria += columnName + '|' + filters[columnName][0].matchMode + '|' + filters[columnName][0].value + ","
                }
            })
            if (searchCriteria.length > 0) {
                searchCriteria = searchCriteria.slice(0, searchCriteria.length - 1)
            }
            console.log('searchCriteria', searchCriteria)
        }
        const entityNameResource = RestService.toPlural(RestService.toCamelCase(this.selectedTable))
        console.log('entityNameResource 2', entityNameResource)
        this.restService.getTableData2(this.selectedTable, searchCriteria, pageNumber, pageSize, this.sortColumns)
            .subscribe(
                {
                    next: (data: any) => {
                        // console.log(data.text())
                        // var csvUrl = URL.createObjectURL(data)
                        // console.log('csvUrl', csvUrl)
                        // window.open(csvUrl)
                        console.log('data', data)
                        console.log('data._embedded[' + entityNameResource + ']', data._embedded[entityNameResource])
                        this.tableRows = data._embedded[entityNameResource]
                        this.totalRowCount = data.page.totalElements
                        this.loadingStatus = false
                    },
                    complete: () => {
                        // this.messageService.clear()
                        // this.uploadProgressMessage = '';
                        // this.uploadResponse = {} as UploadResponse;
                        // this.messageService.add({ severity: 'info', summary: '200', detail: this.tableFileDownloadProgressMessage })
                    }
                    ,
                    error: (httpErrorResponse: HttpErrorResponse) => {
                        this.messageService.add({ severity: 'error', summary: httpErrorResponse.status.toString(), detail: 'Server error. Please contact support.' })
                    }
                });
    }

    /*
    downloads file and return file name
    */
    private downloadFile(httpEvent: HttpResponse<Blob>): string {
        const contentDisposition = httpEvent.headers.get('content-disposition')
        console.log('contentDisposition', contentDisposition)
        const data: Blob = httpEvent.body as Blob
        console.log(data)
        const tableFileUrl = URL.createObjectURL(data)
        let fileName = '<not provided>'
        if (contentDisposition) {
            fileName = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim()
            console.log('fileName', fileName)
            const tableFileAnchor = document.createElement("a")
            tableFileAnchor.download = fileName
            tableFileAnchor.href = tableFileUrl
            tableFileAnchor.click()
        } else {
            window.open(tableFileUrl)
        }
        return fileName
    }
}
