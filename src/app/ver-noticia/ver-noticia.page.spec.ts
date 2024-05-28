import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerNoticiaPage } from './ver-noticia.page';

describe('VerNoticiaPage', () => {
  let component: VerNoticiaPage;
  let fixture: ComponentFixture<VerNoticiaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(VerNoticiaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
