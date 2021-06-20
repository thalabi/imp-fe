import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'byteFormat' })
export class ByteFormatPipe implements PipeTransform {

    transform(value: number, ...args: unknown[]): string {
        let formattedBytes: string
        // B
        // KB 1024
        const KB = 1024
        // MB 1024*1024
        const MB: number = 1024 * 1024
        // GB 1024*1024*1024
        const GB: number = 1024 * 1024 * 1024
        if (value > GB) {
            const gb = value / GB
            formattedBytes = Math.floor(gb * 100) / 100 + " GB"
        } else if (value > MB) {
            const mb = value / MB
            formattedBytes = Math.floor(mb * 100) / 100 + " MB"
        } else if (value > KB) {
            const kb = value / KB
            formattedBytes = Math.floor(kb * 100) / 100 + " KB"
        } else {
            formattedBytes = value + " B"
        }
        return formattedBytes;
    }

}
