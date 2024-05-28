import { TestBed } from '@angular/core/testing';

import { IndicadorService } from './indicadorservices.service';

describe('IndicadorservicesService', () => {
  let service: IndicadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndicadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
