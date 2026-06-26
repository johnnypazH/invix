import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhaCarteira } from './minha-carteira';

describe('MinhaCarteira', () => {
  let component: MinhaCarteira;
  let fixture: ComponentFixture<MinhaCarteira>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhaCarteira]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinhaCarteira);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
