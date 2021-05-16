import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTransferPrimeNgComponent } from './file-transfer-prime-ng.component';

describe('FileTransferPrimeNgComponent', () => {
  let component: FileTransferPrimeNgComponent;
  let fixture: ComponentFixture<FileTransferPrimeNgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileTransferPrimeNgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileTransferPrimeNgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
