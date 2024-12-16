import requests
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv

load_dotenv()

PAGE_SPEED_INSIGHTS_API_KEY = os.getenv("PAGE_SPEED_INSIGHTS_API_KEY")

def fetch_html(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {url} - {e}")
        return None

def analyze_html(html):
    if not html:
        return None

    soup = BeautifulSoup(html, 'html.parser')
    
    title_tag = soup.find('title')
    meta_description = soup.find('meta', attrs={'name': 'description'})
    h1_tag = soup.find('h1')
    images = soup.find_all('img')
    schema_markup = soup.find('script', attrs={'type': 'application/ld+json'})

    title_tag_present = bool(title_tag)
    meta_description_present = bool(meta_description)
    h1_tag_present = bool(h1_tag)
    schema_markup_present = bool(schema_markup)
    
    alt_text_missing = False
    for img in images:
        if not img.get('alt'):
            alt_text_missing = True
            break

    return {
        'title_tag_present': title_tag_present,
        'meta_description_present': meta_description_present,
        'h1_tag_present': h1_tag_present,
        'alt_text_missing': alt_text_missing,
        'schema_markup_present': schema_markup_present
    }

def check_page_speed(url):
    if not PAGE_SPEED_INSIGHTS_API_KEY:
        print("Page speed check is a placeholder. API key needed.")
        return "Page speed score: N/A"
    
    try:
        response = requests.get(
            f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&key={PAGE_SPEED_INSIGHTS_API_KEY}"
        )
        response.raise_for_status()
        data = response.json()
        score = data.get("lighthouseResult", {}).get("categories", {}).get("performance", {}).get("score")
        return score
    except requests.exceptions.RequestException as e:
        print(f"Error fetching PageSpeed Insights API: {e}")
        return None

def check_mobile_friendliness(url):
    if not PAGE_SPEED_INSIGHTS_API_KEY:
        print("Mobile-friendliness check is a placeholder. API key needed.")
        return "Mobile-friendliness: N/A"
    
    try:
        response = requests.get(
            f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&key={PAGE_SPEED_INSIGHTS_API_KEY}"
        )
        response.raise_for_status()
        data = response.json()
        mobile_score = data.get("lighthouseResult", {}).get("categories", {}).get("accessibility", {}).get("score")
        return mobile_score
    except requests.exceptions.RequestException as e:
        print(f"Error fetching PageSpeed Insights API: {e}")
        return None

def check_robots_txt(url):
    try:
        response = requests.get(f"{url}/robots.txt")
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def check_sitemap_xml(url):
    try:
        response = requests.get(f"{url}/sitemap.xml")
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def generate_report(url, html_analysis, page_speed, mobile_friendliness, robots_txt_present, sitemap_xml_present):
    report = f"SEO Report for {url}\n\n"
    if html_analysis:
        report += "On-Page Analysis:\n"
        report += f"  Title tag present: {html_analysis['title_tag_present']}\n"
        report += f"  Meta description present: {html_analysis['meta_description_present']}\n"
        report += f"  H1 tag present: {html_analysis['h1_tag_present']}\n"
        report += f"  Image alt text missing: {html_analysis['alt_text_missing']}\n"
        report += f"  Schema markup present: {html_analysis['schema_markup_present']}\n\n"
    else:
        report += "On-Page Analysis: Could not fetch HTML\n\n"
    
    if page_speed is not None:
        if page_speed >= 0.90:
            page_speed_status = "Good"
        elif page_speed >= 0.50:
            page_speed_status = "Medium"
        else:
            page_speed_status = "Bad"
        report += f"Page Speed: {page_speed} ({page_speed_status})\n"
    else:
        report += "Page Speed: N/A\n"
    
    if mobile_friendliness is not None:
        if mobile_friendliness >= 0.90:
            mobile_status = "Good"
        elif mobile_friendliness >= 0.50:
            mobile_status = "Medium"
        else:
            mobile_status = "Bad"
        report += f"Mobile-Friendliness: {mobile_friendliness} ({mobile_status})\n"
    else:
         report += "Mobile-Friendliness: N/A\n"
    
    report += f"robots.txt present: {robots_txt_present}\n"
    report += f"sitemap.xml present: {sitemap_xml_present}\n"
    return report

if __name__ == "__main__":
    url = "https://www.maasiso.nl"  # Replace with the actual URL
    html = fetch_html(url)
    html_analysis = analyze_html(html)
    page_speed = check_page_speed(url)
    mobile_friendliness = check_mobile_friendliness(url)
    robots_txt_present = check_robots_txt(url)
    sitemap_xml_present = check_sitemap_xml(url)
    report = generate_report(url, html_analysis, page_speed, mobile_friendliness, robots_txt_present, sitemap_xml_present)
    print(report)
