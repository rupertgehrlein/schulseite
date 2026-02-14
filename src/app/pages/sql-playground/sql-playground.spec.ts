import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlPlayground } from './sql-playground';

describe('SqlPlayground', () => {
  let component: SqlPlayground;
  let fixture: ComponentFixture<SqlPlayground>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SqlPlayground]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SqlPlayground);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
