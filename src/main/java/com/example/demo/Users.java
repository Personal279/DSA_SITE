package com.example.demo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
@Table(name = "spring_table")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;

    @Column(name = "email")
    private String email;

    private String Linked_link;
    private String git_link;
    private String portfolio;
    private String country;

    public Users() {}

    public Users(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLinked_link() {
        return Linked_link;
    }

    public void setLinked_link(String linked_link) {
        Linked_link = linked_link;
    }

    public String getGit_link() {
        return git_link;
    }

    public void setGit_link(String git_link) {
        this.git_link = git_link;
    }

    public String getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(String portfolio) {
        this.portfolio = portfolio;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }
}












































//package com.example.demo;
//
//import jakarta.persistence.Entity;
//import jakarta.persistence.Id;
//import jakarta.persistence.Table;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//
//@Entity
//@Table(name="spring_table")
//public class Users {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private String username;
//    private String password;
//    private String e_mail;
//    private String Linked_link;
//    private String git_link;
//    private String portfolio;
//    private String country;
//
//    public Users() {}
//
//    public Users(String username, String password,String e_mail) {
//        this.username = username;
//        this.password = password;
//        this.e_mail=e_mail;
//    }
//
//    public Long getId() {
//        return id;
//    }
//
//    public String getUsername() {
//        return username;
//    }
//
//    public void setUsername(String username) {
//        this.username = username;
//    }
//
//    public String getPassword() {
//        return password;
//    }
//
//    public void setPassword(String password) {
//        this.password = password;
//    }
//
//    public String getE_mail() {
//        return e_mail;
//    }
//
//    public void setE_mail(String e_mail) {
//        this.e_mail = e_mail;
//    }
//
//    public String getLinked_link() {
//        return Linked_link;
//    }
//
//    public void setLinked_link(String linked_link) {
//        Linked_link = linked_link;
//    }
//
//    public String getGit_link() {
//        return git_link;
//    }
//
//    public void setGit_link(String git_link) {
//        this.git_link = git_link;
//    }
//
//    public String getPortfolio() {
//        return portfolio;
//    }
//
//    public void setPortfolio(String portfolio) {
//        this.portfolio = portfolio;
//    }
//
//    public String getCountry() {
//        return country;
//    }
//
//    public void setCountry(String country) {
//        this.country = country;
//    }
//}
