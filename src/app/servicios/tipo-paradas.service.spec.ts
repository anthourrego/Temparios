import { TestBed } from '@angular/core/testing';

import { TipoParadasService } from './tipo-paradas.service';

describe('TipoParadasService', () => {
  let service: TipoParadasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoParadasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
