import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MurderMystery } from './murder-mystery';

describe('MurderMystery', () => {
  let component: MurderMystery;
  let fixture: ComponentFixture<MurderMystery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MurderMystery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MurderMystery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
